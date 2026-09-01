use std::fs;
use std::process::Command;
use tempfile::tempdir;

fn bin() -> Command {
    Command::new(env!("CARGO_BIN_EXE_edit-trail"))
}

#[test]
fn documented_index_find_and_report_workflow() {
    let archive = tempdir().unwrap();
    let index = archive.path().join("trail.json");
    let report = archive.path().join("report.html");
    fs::write(archive.path().join("portrait.CR3.xmp"), r#"<x:xmpmeta xmlns:x="x" xmlns:rdf="rdf" xmlns:darktable="darktable"><rdf:Description darktable:history_end="3"><darktable:history><rdf:Seq><rdf:li darktable:num="0" darktable:operation="exposure" darktable:enabled="1"/><rdf:li darktable:num="1" darktable:operation="denoiseprofile" darktable:enabled="1"/><rdf:li darktable:num="2" darktable:operation="crop" darktable:enabled="1"/><rdf:li darktable:num="3" darktable:operation="contrast" darktable:enabled="1"/></rdf:Seq></darktable:history></rdf:Description></x:xmpmeta>"#).unwrap();
    fs::write(archive.path().join("broken.xmp"), "<not-closed").unwrap();

    let output = bin()
        .args([
            "index",
            archive.path().to_str().unwrap(),
            "--output",
            index.to_str().unwrap(),
            "--json",
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let summary: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(summary["sidecars"], 2);
    assert_eq!(summary["warnings"], 1);

    let output = bin()
        .args([
            "find",
            "-o",
            "denoise",
            "-o",
            "crop",
            "--match",
            "all",
            "--index",
            index.to_str().unwrap(),
            "--json",
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let matches: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(matches.as_array().unwrap().len(), 1);

    let output = bin()
        .args(["find", "-o", "contrast", "--index", index.to_str().unwrap()])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(3));
    assert!(String::from_utf8_lossy(&output.stdout).contains("No matches"));

    let output = bin()
        .args([
            "find",
            "--operation",
            "   ",
            "--index",
            index.to_str().unwrap(),
        ])
        .output()
        .unwrap();
    assert_eq!(output.status.code(), Some(2));
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("operation names cannot be blank"));
    assert!(stderr.contains("--operation crop"));

    let output = bin()
        .args([
            "report",
            "--index",
            index.to_str().unwrap(),
            "--output",
            report.to_str().unwrap(),
            "-o",
            "crop",
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    let html = fs::read_to_string(report).unwrap();
    assert!(html.contains("Edit Trail report") && html.contains("portrait.CR3"));
}

#[test]
fn empty_archive_is_a_successful_first_class_state() {
    let archive = tempdir().unwrap();
    let index = archive.path().join("empty.json");
    let output = bin()
        .args([
            "index",
            archive.path().to_str().unwrap(),
            "-o",
            index.to_str().unwrap(),
        ])
        .output()
        .unwrap();
    assert!(output.status.success());
    assert!(String::from_utf8_lossy(&output.stdout).contains("No supported sidecars"));
}

#[test]
fn demo_creates_searchable_sample_data_in_the_requested_sandbox() {
    let parent = tempdir().unwrap();
    let workspace = parent.path().join("demo-workspace");
    let output = bin()
        .args(["demo", "--output", workspace.to_str().unwrap(), "--json"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let summary: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(summary["sidecars"], 3);
    assert_eq!(summary["matches"], 2);
    assert!(workspace.join("edit-trail-demo.json").is_file());
    let report = fs::read_to_string(workspace.join("edit-trail-demo-report.html")).unwrap();
    assert!(report.contains("night-market-1842.NEF") && report.contains("lantern-0917.ARW"));

    let repeated = bin()
        .args(["demo", "--output", workspace.to_str().unwrap()])
        .output()
        .unwrap();
    assert_eq!(repeated.status.code(), Some(1));
    assert!(String::from_utf8_lossy(&repeated.stderr).contains("Choose a new --output directory"));
}
