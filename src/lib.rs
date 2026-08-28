//! Parsing, indexing, and querying for Edit Trail.
//!
//! ```no_run
//! use edit_trail::{build_index, query_index, MatchMode};
//! use std::path::Path;
//!
//! let index = build_index(Path::new("/photos"), false, false)?;
//! let wanted = vec!["denoise".to_string(), "crop".to_string()];
//! let matches = query_index(&index, &wanted, MatchMode::All);
//! println!("{} files match", matches.len());
//! # Ok::<(), std::io::Error>(())
//! ```

use quick_xml::Reader;
use quick_xml::events::{BytesStart, Event};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

pub const SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Operation {
    pub name: String,
    pub active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct SidecarRecord {
    pub sidecar: PathBuf,
    pub source_image: PathBuf,
    pub editor: String,
    pub modified_unix: Option<u64>,
    pub operations: Vec<Operation>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub warnings: Vec<String>,
}

impl SidecarRecord {
    pub fn active_operations(&self) -> impl Iterator<Item = &str> {
        self.operations
            .iter()
            .filter(|op| op.active)
            .map(|op| op.name.as_str())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct TrailIndex {
    pub schema_version: u32,
    pub root: PathBuf,
    pub generated_unix: u64,
    pub sidecars_seen: usize,
    pub records: Vec<SidecarRecord>,
    #[serde(default)]
    pub scan_warnings: Vec<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MatchMode {
    All,
    Any,
}

/// Recursively indexes supported sidecars. A bad file becomes a warning and
/// does not abort the archive scan.
pub fn build_index(
    root: &Path,
    include_hidden: bool,
    follow_links: bool,
) -> io::Result<TrailIndex> {
    let canonical_root = root.canonicalize()?;
    let mut records = Vec::new();
    let mut scan_warnings = Vec::new();
    let walker = WalkDir::new(&canonical_root)
        .follow_links(follow_links)
        .into_iter();

    for entry in walker
        .filter_entry(|entry| include_hidden || entry.depth() == 0 || !is_hidden(entry.path()))
    {
        let entry = match entry {
            Ok(entry) => entry,
            Err(error) => {
                scan_warnings.push(error.to_string());
                continue;
            }
        };
        if !entry.file_type().is_file() || !is_sidecar(entry.path()) {
            continue;
        }
        match parse_sidecar(entry.path()) {
            Ok(record) => records.push(record),
            Err(error) => records.push(SidecarRecord {
                sidecar: entry.path().to_path_buf(),
                source_image: infer_source_image(entry.path()),
                editor: "unknown".into(),
                modified_unix: modified_unix(entry.path()),
                operations: Vec::new(),
                warnings: vec![format!("Could not parse sidecar: {error}")],
            }),
        }
    }
    records.sort_by(|a, b| a.sidecar.cmp(&b.sidecar));
    Ok(TrailIndex {
        schema_version: SCHEMA_VERSION,
        root: canonical_root,
        generated_unix: now_unix(),
        sidecars_seen: records.len(),
        records,
        scan_warnings,
    })
}

pub fn save_index(index: &TrailIndex, path: &Path) -> io::Result<()> {
    fs::write(
        path,
        serde_json::to_vec_pretty(index).map_err(io::Error::other)?,
    )
}

pub fn load_index(path: &Path) -> io::Result<TrailIndex> {
    let index: TrailIndex = serde_json::from_slice(&fs::read(path)?).map_err(io::Error::other)?;
    if index.schema_version != SCHEMA_VERSION {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            format!(
                "index schema {} is not supported (expected {}); run `edit-trail index` again",
                index.schema_version, SCHEMA_VERSION
            ),
        ));
    }
    Ok(index)
}

/// Returns records whose active operations match the requested names.
pub fn query_index<'a>(
    index: &'a TrailIndex,
    operations: &[String],
    mode: MatchMode,
) -> Vec<&'a SidecarRecord> {
    let wanted: Vec<String> = operations
        .iter()
        .map(|name| normalize_operation(name))
        .collect();
    index
        .records
        .iter()
        .filter(|record| {
            let active: BTreeSet<&str> = record.active_operations().collect();
            match mode {
                MatchMode::All => wanted.iter().all(|name| active.contains(name.as_str())),
                MatchMode::Any => wanted.iter().any(|name| active.contains(name.as_str())),
            }
        })
        .collect()
}

pub fn operation_counts(index: &TrailIndex) -> BTreeMap<String, usize> {
    let mut counts = BTreeMap::new();
    for record in &index.records {
        for operation in record.active_operations() {
            *counts.entry(operation.to_string()).or_insert(0) += 1;
        }
    }
    counts
}

pub fn parse_sidecar(path: &Path) -> io::Result<SidecarRecord> {
    let content = fs::read_to_string(path)?;
    let ext = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    let (editor, operations, warnings) = if ext.eq_ignore_ascii_case("pp3") {
        parse_pp3(&content)
    } else {
        parse_xml(&content).map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))?
    };
    Ok(SidecarRecord {
        sidecar: path.to_path_buf(),
        source_image: infer_source_image(path),
        editor,
        modified_unix: modified_unix(path),
        operations,
        warnings,
    })
}

fn parse_xml(content: &str) -> Result<(String, Vec<Operation>, Vec<String>), String> {
    let mut reader = Reader::from_str(content);
    reader.config_mut().trim_text(true);
    let mut editor = "generic XMP".to_string();
    let mut history_end: Option<u32> = None;
    let mut modules: BTreeMap<String, (u32, bool)> = BTreeMap::new();
    let mut inferred: BTreeMap<String, bool> = BTreeMap::new();
    let mut saw_element = false;

    loop {
        match reader.read_event() {
            Ok(Event::Start(event)) | Ok(Event::Empty(event)) => {
                saw_element = true;
                let tag = local_name(event.name().as_ref());
                let attrs = attributes(&event, &reader)?;
                let joined = format!(
                    "{} {}",
                    tag,
                    attrs.keys().cloned().collect::<Vec<_>>().join(" ")
                )
                .to_ascii_lowercase();
                if joined.contains("darktable")
                    || (attrs.contains_key("operation") && attrs.contains_key("num"))
                {
                    editor = "darktable".into();
                } else if joined.contains("crs") || joined.contains("cameraraw") {
                    editor = "Adobe Camera Raw / Lightroom".into();
                } else if joined.contains("photolab") || joined.contains("dop") {
                    editor = "DxO PhotoLab".into();
                }
                if let Some(value) = attr(&attrs, &["history_end"]) {
                    history_end = value.parse().ok();
                }
                collect_module(&attrs, history_end, &mut modules);
                infer_adobe_operations(&tag, &attrs, &mut inferred);
            }
            Ok(Event::Eof) => break,
            Err(error) => return Err(format!("XML at byte {}: {error}", reader.error_position())),
            _ => {}
        }
    }
    if !saw_element {
        return Err("empty XML document".into());
    }
    if editor == "generic XMP" && !inferred.is_empty() {
        editor = "Adobe Camera Raw / Lightroom".into();
    }
    for (name, active) in inferred {
        modules.entry(name).or_insert((u32::MAX, active));
    }
    let mut consolidated: BTreeMap<String, bool> = BTreeMap::new();
    for (key, (_, active)) in modules {
        let name = key.split('\0').next().unwrap_or(&key).to_string();
        consolidated
            .entry(name)
            .and_modify(|existing| *existing |= active)
            .or_insert(active);
    }
    let operations = consolidated
        .into_iter()
        .map(|(name, active)| Operation { name, active })
        .collect();
    Ok((editor, operations, Vec::new()))
}

fn collect_module(
    attrs: &BTreeMap<String, String>,
    history_end: Option<u32>,
    modules: &mut BTreeMap<String, (u32, bool)>,
) {
    let raw_name = attr(attrs, &["operation", "module", "tool"]).or_else(|| {
        attr(attrs, &["enabled", "active", "applied"]).and_then(|_| attr(attrs, &["name"]))
    });
    let Some(raw_name) = raw_name else {
        return;
    };
    let name = normalize_operation(raw_name);
    if name.is_empty() {
        return;
    }
    let number = attr(attrs, &["num", "index", "step"])
        .and_then(|v| v.parse().ok())
        .unwrap_or(u32::MAX - 1);
    if history_end.is_some_and(|end| number >= end) {
        return;
    }
    let enabled = attr(attrs, &["enabled", "active", "applied"])
        .map(parse_bool)
        .unwrap_or(true);
    let instance = attr(attrs, &["multi_name", "instance", "multi_priority"]).unwrap_or("");
    let key = format!("{name}\0{instance}");
    if modules.get(&key).is_none_or(|(prior, _)| number >= *prior) {
        modules.insert(key, (number, enabled));
    }
}

fn infer_adobe_operations(
    tag: &str,
    attrs: &BTreeMap<String, String>,
    out: &mut BTreeMap<String, bool>,
) {
    let mut inspect = attrs.clone();
    inspect.insert(tag.to_string(), "true".into());
    for (raw_key, value) in inspect {
        let key = raw_key.to_ascii_lowercase();
        let active =
            parse_bool(&value) || value.parse::<f64>().is_ok_and(|v| v.abs() > f64::EPSILON);
        if (key.contains("hascrop") && parse_bool(&value)) || (key == "cropped" && active) {
            out.insert("crop".into(), true);
        }
        if (key.contains("luminancesmoothing")
            || key.contains("colornoisereduction")
            || key.contains("denoise"))
            && active
        {
            out.insert("denoise".into(), true);
        }
        if (key.contains("maskgroup")
            || key.contains("correctionmask")
            || key == "mask"
            || key == "masking")
            && active
        {
            out.insert("masking".into(), true);
        }
        if key.contains("perspective") && active {
            out.insert("perspective".into(), true);
        }
        if key.contains("vignette") && active {
            out.insert("vignette".into(), true);
        }
        if key.contains("texture") && active {
            out.insert("texture".into(), true);
        }
        if key.contains("clarity") && active {
            out.insert("clarity".into(), true);
        }
        if key.contains("exposure") && active {
            out.insert("exposure".into(), true);
        }
    }
}

fn parse_pp3(content: &str) -> (String, Vec<Operation>, Vec<String>) {
    let mut section = String::new();
    let mut operations = BTreeMap::new();
    for line in content.lines() {
        let line = line.trim();
        if line.starts_with('[') && line.ends_with(']') {
            section = normalize_operation(&line[1..line.len() - 1]);
        } else if let Some((key, value)) = line.split_once('=') {
            if key.trim().eq_ignore_ascii_case("Enabled") && !section.is_empty() {
                operations.insert(section.clone(), parse_bool(value.trim()));
            }
        }
    }
    (
        "RawTherapee".into(),
        operations
            .into_iter()
            .map(|(name, active)| Operation { name, active })
            .collect(),
        Vec::new(),
    )
}

fn attributes(
    event: &BytesStart<'_>,
    reader: &Reader<&[u8]>,
) -> Result<BTreeMap<String, String>, String> {
    let mut values = BTreeMap::new();
    for attribute in event.attributes().with_checks(false) {
        let attribute = attribute.map_err(|error| error.to_string())?;
        let key = local_name(attribute.key.as_ref());
        let value = attribute
            .decode_and_unescape_value(reader.decoder())
            .map_err(|error| error.to_string())?;
        values.insert(key, value.into_owned());
    }
    Ok(values)
}

fn attr<'a>(attrs: &'a BTreeMap<String, String>, names: &[&str]) -> Option<&'a str> {
    attrs
        .iter()
        .find(|(key, _)| names.iter().any(|name| key.eq_ignore_ascii_case(name)))
        .map(|(_, value)| value.as_str())
}

fn local_name(bytes: &[u8]) -> String {
    let full = String::from_utf8_lossy(bytes);
    full.rsplit(':').next().unwrap_or(&full).to_string()
}

fn parse_bool(value: &str) -> bool {
    matches!(
        value.trim().to_ascii_lowercase().as_str(),
        "1" | "true" | "yes" | "on"
    )
}

pub fn normalize_operation(value: &str) -> String {
    let clean = value.trim().to_ascii_lowercase().replace(['_', '-'], " ");
    let clean = clean.split_whitespace().collect::<Vec<_>>().join(" ");
    match clean.as_str() {
        "noise reduction"
        | "noisereduction"
        | "denoiseprofile"
        | "raw denoise"
        | "impulse denoise"
        | "color noise reduction"
        | "directional pyramid denoising"
        | "deepprime" => "denoise".into(),
        "contrast brightness saturation" => "contrast".into(),
        "rotate and perspective" | "perspective correction" => "perspective".into(),
        "graduated filter" | "local adjustments" | "mask manager" | "masks manager" => {
            "masking".into()
        }
        "lens correction" | "lensfun" => "lens correction".into(),
        "color balance rgb" | "colorbalance rgb" => "color balance rgb".into(),
        _ => clean,
    }
}

fn infer_source_image(path: &Path) -> PathBuf {
    path.with_extension("")
}
fn is_sidecar(path: &Path) -> bool {
    path.extension()
        .and_then(|value| value.to_str())
        .is_some_and(|ext| {
            ["xmp", "dop", "pp3"]
                .iter()
                .any(|candidate| ext.eq_ignore_ascii_case(candidate))
        })
}
fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.starts_with('.') && name != ".")
}
fn modified_unix(path: &Path) -> Option<u64> {
    fs::metadata(path)
        .ok()?
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()
        .map(|duration| duration.as_secs())
}
fn now_unix() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub fn html_escape(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}
pub fn csv_escape(value: &str) -> String {
    if value.contains([',', '"', '\n', '\r']) {
        format!("\"{}\"", value.replace('"', "\"\""))
    } else {
        value.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalises_common_editor_names() {
        assert_eq!(normalize_operation("denoiseprofile"), "denoise");
        assert_eq!(normalize_operation("Rotate_and-perspective"), "perspective");
    }

    #[test]
    fn detects_adobe_attributes() {
        let xml = r#"<x:xmpmeta xmlns:x="x" xmlns:crs="crs"><rdf:Description xmlns:rdf="rdf" crs:HasCrop="True" crs:LuminanceSmoothing="25"><crs:MaskGroupBasedCorrections /></rdf:Description></x:xmpmeta>"#;
        let (_, operations, _) = parse_xml(xml).unwrap();
        let names: BTreeSet<_> = operations
            .iter()
            .filter(|op| op.active)
            .map(|op| op.name.as_str())
            .collect();
        assert!(names.contains("crop") && names.contains("denoise") && names.contains("masking"));
    }

    #[test]
    fn honours_history_boundary_and_consolidates_instances() {
        let xml = r#"<x:xmpmeta xmlns:x="x" xmlns:d="d"><d:Description d:history_end="3"><d:li d:num="0" d:operation="exposure" d:enabled="1" d:multi_priority="0"/><d:li d:num="1" d:operation="exposure" d:enabled="1" d:multi_priority="1"/><d:li d:num="2" d:operation="crop" d:enabled="0"/><d:li d:num="3" d:operation="contrast" d:enabled="1"/></d:Description></x:xmpmeta>"#;
        let (_, operations, _) = parse_xml(xml).unwrap();
        assert_eq!(
            operations.iter().filter(|op| op.name == "exposure").count(),
            1
        );
        assert!(
            operations
                .iter()
                .any(|op| op.name == "exposure" && op.active)
        );
        assert!(operations.iter().any(|op| op.name == "crop" && !op.active));
        assert!(!operations.iter().any(|op| op.name == "contrast"));
    }

    #[test]
    fn parses_rawtherapee_sections() {
        let (_, operations, _) =
            parse_pp3("[Crop]\nEnabled=true\n[Directional Pyramid Denoising]\nEnabled=1\n");
        assert!(operations.iter().any(|op| op.name == "crop" && op.active));
        assert!(
            operations
                .iter()
                .any(|op| op.name == "denoise" && op.active)
        );
    }
}
