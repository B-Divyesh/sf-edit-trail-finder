use clap::{Args, Parser, Subcommand, ValueEnum};
use edit_trail::{
    MatchMode, SidecarRecord, TrailIndex, build_index, csv_escape, html_escape, load_index,
    operation_counts, query_index, save_index,
};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};
use std::time::{SystemTime, UNIX_EPOCH};

const DEFAULT_INDEX: &str = ".edit-trail.json";

#[derive(Parser, Debug)]
#[command(
    name = "edit-trail",
    version,
    about = "Find photos by the edits recorded in their sidecars",
    long_about = "Edit Trail indexes local XMP, DOP, and PP3 sidecars, normalises active edit operations, and finds files by operation combinations. It reads metadata only—never image pixels or remote services."
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Recursively scan an archive and write a reusable index
    Index(IndexArgs),
    /// Find indexed sidecars with active operations
    Find(FindArgs),
    /// List every active operation and its image count
    Operations(CommonIndexArgs),
    /// Generate a self-contained offline HTML audit report
    Report(ReportArgs),
    /// Create and search a bundled sample archive in an isolated directory
    Demo(DemoArgs),
}

#[derive(Args, Debug)]
struct DemoArgs {
    /// New directory for the sample archive, index, and report
    #[arg(long, value_name = "DIRECTORY")]
    output: Option<PathBuf>,
    /// Print the demo summary as JSON
    #[arg(long)]
    json: bool,
}

#[derive(Args, Debug)]
struct IndexArgs {
    /// Archive directory containing XMP, DOP, or PP3 sidecars
    #[arg(value_name = "ARCHIVE")]
    archive: PathBuf,
    /// Path for the reusable JSON index
    #[arg(short, long, default_value = DEFAULT_INDEX, value_name = "FILE")]
    output: PathBuf,
    /// Scan dot-directories and dotfiles
    #[arg(long)]
    include_hidden: bool,
    /// Follow symbolic links (cycle detection remains enabled)
    #[arg(long)]
    follow_links: bool,
    /// Print the index summary as JSON
    #[arg(long)]
    json: bool,
}

#[derive(Args, Debug)]
struct CommonIndexArgs {
    /// Previously generated Edit Trail index
    #[arg(long, default_value = DEFAULT_INDEX, value_name = "FILE")]
    index: PathBuf,
    /// Print machine-readable JSON
    #[arg(long)]
    json: bool,
}

#[derive(Args, Debug)]
struct FindArgs {
    /// Active operation to match; repeat for combinations
    #[arg(short = 'o', long = "operation", required = true, value_name = "NAME")]
    operations: Vec<String>,
    /// Require all named operations or any named operation
    #[arg(long, value_enum, default_value_t = MatchArg::All)]
    r#match: MatchArg,
    /// Previously generated Edit Trail index
    #[arg(long, default_value = DEFAULT_INDEX, value_name = "FILE")]
    index: PathBuf,
    /// Output style
    #[arg(long, value_enum, default_value_t = FormatArg::Table)]
    format: FormatArg,
    /// Alias for --format json
    #[arg(long, conflicts_with = "format")]
    json: bool,
    /// Stop output after this many matches
    #[arg(long, value_parser = clap::value_parser!(usize), value_name = "N")]
    limit: Option<usize>,
    /// Open each matching source folder with the operating system (max 10)
    #[arg(long)]
    open: bool,
}

#[derive(Args, Debug)]
struct ReportArgs {
    /// Previously generated Edit Trail index
    #[arg(long, default_value = DEFAULT_INDEX, value_name = "FILE")]
    index: PathBuf,
    /// Report destination
    #[arg(long, default_value = "edit-trail-report.html", value_name = "HTML")]
    output: PathBuf,
    /// Include only records with this active operation; repeat for combinations
    #[arg(short = 'o', long = "operation", value_name = "NAME")]
    operations: Vec<String>,
    /// Require all named operations or any named operation
    #[arg(long, value_enum, default_value_t = MatchArg::All)]
    r#match: MatchArg,
    /// Open the generated report with the operating system
    #[arg(long)]
    open: bool,
}

#[derive(Clone, Copy, Debug, ValueEnum)]
enum MatchArg {
    All,
    Any,
}

impl From<MatchArg> for MatchMode {
    fn from(value: MatchArg) -> Self {
        match value {
            MatchArg::All => MatchMode::All,
            MatchArg::Any => MatchMode::Any,
        }
    }
}

#[derive(Clone, Copy, Debug, ValueEnum)]
enum FormatArg {
    Table,
    Json,
    Csv,
}

#[derive(Serialize)]
struct IndexSummary<'a> {
    index: &'a Path,
    root: &'a Path,
    sidecars: usize,
    parsed: usize,
    warnings: usize,
}

fn main() -> ExitCode {
    match run(Cli::parse()) {
        Ok(code) => ExitCode::from(code),
        Err(error) => {
            eprintln!("edit-trail: {error}");
            ExitCode::from(1)
        }
    }
}

fn run(cli: Cli) -> Result<u8, String> {
    match cli.command {
        Commands::Index(args) => index_command(args),
        Commands::Find(args) => find_command(args),
        Commands::Operations(args) => operations_command(args),
        Commands::Report(args) => report_command(args),
        Commands::Demo(args) => demo_command(args),
    }
}

#[derive(Serialize)]
struct DemoSummary<'a> {
    workspace: &'a Path,
    archive: &'a Path,
    index: &'a Path,
    report: &'a Path,
    sidecars: usize,
    matches: usize,
}

fn demo_command(args: DemoArgs) -> Result<u8, String> {
    let workspace = args.output.unwrap_or_else(|| {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        std::env::temp_dir().join(format!(
            "edit-trail-demo-{}-{timestamp}",
            std::process::id()
        ))
    });
    if workspace.exists() {
        return Err(format!(
            "demo directory already exists: {}. Choose a new --output directory",
            workspace.display()
        ));
    }
    let archive = workspace.join("sample-archive");
    fs::create_dir_all(&archive)
        .map_err(|error| format!("could not create {}: {error}", archive.display()))?;
    fs::write(
        archive.join("night-market-1842.NEF.xmp"),
        include_str!("../examples/sample-archive/night-market-1842.NEF.xmp"),
    )
    .map_err(|error| format!("could not write demo sidecar: {error}"))?;
    fs::write(
        archive.join("lantern-0917.ARW.dop"),
        include_str!("../examples/sample-archive/lantern-0917.ARW.dop"),
    )
    .map_err(|error| format!("could not write demo sidecar: {error}"))?;
    fs::write(
        archive.join("after-rain-2201.RAF.pp3"),
        include_str!("../examples/sample-archive/after-rain-2201.RAF.pp3"),
    )
    .map_err(|error| format!("could not write demo sidecar: {error}"))?;

    let index = build_index(&archive, false, false)
        .map_err(|error| format!("could not scan demo archive: {error}"))?;
    let index_path = workspace.join("edit-trail-demo.json");
    save_index(&index, &index_path)
        .map_err(|error| format!("could not write {}: {error}", index_path.display()))?;
    let wanted = ["denoise".to_string(), "crop".to_string()];
    let matches = query_index(&index, &wanted, MatchMode::All);
    let report_path = workspace.join("edit-trail-demo-report.html");
    fs::write(
        &report_path,
        render_report(&index, &matches, &wanted, MatchArg::All),
    )
    .map_err(|error| format!("could not write {}: {error}", report_path.display()))?;

    let summary = DemoSummary {
        workspace: &workspace,
        archive: &archive,
        index: &index_path,
        report: &report_path,
        sidecars: index.sidecars_seen,
        matches: matches.len(),
    };
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&summary).map_err(|error| error.to_string())?
        );
    } else {
        println!("Demo ready at {}", workspace.display());
        println!(
            "{} of {} sample sidecars match denoise + crop.",
            matches.len(),
            index.sidecars_seen
        );
        println!("Offline report: {}", report_path.display());
        println!("Nothing was written outside this demo directory.");
    }
    Ok(0)
}

fn index_command(args: IndexArgs) -> Result<u8, String> {
    if !args.archive.is_dir() {
        return Err(format!(
            "archive is not a readable directory: {}",
            args.archive.display()
        ));
    }
    let index = build_index(&args.archive, args.include_hidden, args.follow_links)
        .map_err(|error| format!("could not scan {}: {error}", args.archive.display()))?;
    save_index(&index, &args.output)
        .map_err(|error| format!("could not write {}: {error}", args.output.display()))?;
    let warnings = index.scan_warnings.len()
        + index
            .records
            .iter()
            .map(|r| r.warnings.len())
            .sum::<usize>();
    let parsed = index
        .records
        .iter()
        .filter(|r| r.warnings.is_empty())
        .count();
    let summary = IndexSummary {
        index: &args.output,
        root: &index.root,
        sidecars: index.sidecars_seen,
        parsed,
        warnings,
    };
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&summary).map_err(|e| e.to_string())?
        );
    } else if index.sidecars_seen == 0 {
        println!(
            "No supported sidecars found under {}. Looked for .xmp, .dop, and .pp3 files.",
            index.root.display()
        );
        println!("Index written to {}", args.output.display());
    } else {
        println!(
            "Indexed {} sidecars ({} parsed, {} warnings) → {}",
            index.sidecars_seen,
            parsed,
            warnings,
            args.output.display()
        );
    }
    Ok(0)
}

fn find_command(args: FindArgs) -> Result<u8, String> {
    let index = read_index(&args.index)?;
    let mut matches = query_index(&index, &args.operations, args.r#match.into());
    if let Some(limit) = args.limit {
        matches.truncate(limit);
    }
    let format = if args.json {
        FormatArg::Json
    } else {
        args.format
    };
    match format {
        FormatArg::Json => println!(
            "{}",
            serde_json::to_string_pretty(&matches).map_err(|e| e.to_string())?
        ),
        FormatArg::Csv => print_csv(&matches),
        FormatArg::Table => print_table(&matches, &args.operations, args.r#match),
    }
    if args.open {
        if matches.len() > 10 {
            return Err("refusing to open more than 10 folders; add --limit 10".into());
        }
        for record in &matches {
            open_path(record.source_image.parent().unwrap_or(&index.root))?;
        }
    }
    Ok(if matches.is_empty() { 3 } else { 0 })
}

fn operations_command(args: CommonIndexArgs) -> Result<u8, String> {
    let index = read_index(&args.index)?;
    let counts = operation_counts(&index);
    if args.json {
        println!(
            "{}",
            serde_json::to_string_pretty(&counts).map_err(|e| e.to_string())?
        );
    } else if counts.is_empty() {
        println!("No active operations found. Re-index after checking the parse warnings.");
    } else {
        let width = counts.keys().map(String::len).max().unwrap_or(9).max(9);
        println!("{:<width$}  IMAGES", "OPERATION", width = width);
        for (name, count) in counts {
            println!("{name:<width$}  {count:>6}", width = width);
        }
    }
    Ok(0)
}

fn report_command(args: ReportArgs) -> Result<u8, String> {
    let index = read_index(&args.index)?;
    let records: Vec<&SidecarRecord> = if args.operations.is_empty() {
        index.records.iter().collect()
    } else {
        query_index(&index, &args.operations, args.r#match.into())
    };
    let html = render_report(&index, &records, &args.operations, args.r#match);
    fs::write(&args.output, html)
        .map_err(|error| format!("could not write {}: {error}", args.output.display()))?;
    println!(
        "Report with {} records written to {}",
        records.len(),
        args.output.display()
    );
    if args.open {
        open_path(&args.output)?;
    }
    Ok(0)
}

fn read_index(path: &Path) -> Result<TrailIndex, String> {
    load_index(path).map_err(|error| {
        format!(
            "could not read {}: {error}. Run `edit-trail index <ARCHIVE>` first",
            path.display()
        )
    })
}

fn print_table(records: &[&SidecarRecord], operations: &[String], mode: MatchArg) {
    if records.is_empty() {
        println!(
            "No matches for {} ({})",
            operations.join(" + "),
            match mode {
                MatchArg::All => "all",
                MatchArg::Any => "any",
            }
        );
        println!("Try `edit-trail operations` to see names present in this index.");
        return;
    }
    println!("MATCHES  {}", records.len());
    for record in records {
        println!("{}", record.source_image.display());
        println!(
            "  {} · {}",
            record.editor,
            record.active_operations().collect::<Vec<_>>().join(", ")
        );
    }
}

fn print_csv(records: &[&SidecarRecord]) {
    println!("source_image,sidecar,editor,active_operations,warnings");
    for record in records {
        println!(
            "{},{},{},{},{}",
            csv_escape(&record.source_image.to_string_lossy()),
            csv_escape(&record.sidecar.to_string_lossy()),
            csv_escape(&record.editor),
            csv_escape(&record.active_operations().collect::<Vec<_>>().join(";")),
            csv_escape(&record.warnings.join(";"))
        );
    }
}

fn render_report(
    index: &TrailIndex,
    records: &[&SidecarRecord],
    operations: &[String],
    mode: MatchArg,
) -> String {
    let query = if operations.is_empty() {
        "All indexed sidecars".into()
    } else {
        format!(
            "{}: {}",
            match mode {
                MatchArg::All => "All active",
                MatchArg::Any => "Any active",
            },
            operations.join(" + ")
        )
    };
    let mut rows = String::new();
    for record in records {
        let ops = record
            .active_operations()
            .map(|op| format!("<span>{}</span>", html_escape(op)))
            .collect::<Vec<_>>()
            .join("");
        let warning = if record.warnings.is_empty() {
            String::new()
        } else {
            format!(
                "<small class=warning>{}</small>",
                html_escape(&record.warnings.join("; "))
            )
        };
        rows.push_str(&format!(
            "<tr><td><strong>{}</strong><small>{}</small>{}</td><td>{}</td><td>{}</td></tr>",
            html_escape(&record.source_image.to_string_lossy()),
            html_escape(&record.sidecar.to_string_lossy()),
            warning,
            html_escape(&record.editor),
            ops
        ));
    }
    let empty = if records.is_empty() {
        "<p class=empty>No records matched this operation query. Run <code>edit-trail operations</code> to inspect the index vocabulary.</p>"
    } else {
        ""
    };
    format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Edit Trail report — {query}</title><style>
:root{{--ink:#09090b;--surface:#15141a;--text:#fff7e6;--muted:#cfc5b4;--cyan:#59f3e6;--pink:#ff5ca8;--amber:#ffc857}}*{{box-sizing:border-box}}body{{margin:0;background:var(--ink);color:var(--text);font:16px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}}main{{width:min(1180px,calc(100% - 32px));margin:auto;padding:56px 0}}h1{{font-size:clamp(2rem,7vw,4.5rem);margin:0;letter-spacing:-.06em}}.eyebrow{{color:var(--cyan);text-transform:uppercase;letter-spacing:.12em}}.meta{{color:var(--muted);max-width:75ch}}.stats{{display:flex;gap:24px;margin:32px 0;padding:20px;border-left:4px solid var(--amber);background:var(--surface)}}table{{width:100%;border-collapse:collapse}}th{{color:var(--cyan);text-align:left}}td,th{{padding:16px 12px;border-bottom:1px solid #393740;vertical-align:top}}td small{{display:block;color:var(--muted);overflow-wrap:anywhere}}td span{{display:inline-block;color:var(--pink);margin:0 8px 8px 0}}.warning{{color:var(--amber)}}code{{color:var(--cyan)}}.empty{{padding:24px;background:var(--surface)}}@media(max-width:700px){{thead{{display:none}}tr,td{{display:block}}td{{border:0;padding:8px 12px}}tr{{display:block;border-bottom:1px solid #393740;padding:12px 0}}.stats{{display:block}}}}@media print{{:root{{--ink:#fff;--surface:#eee;--text:#111;--muted:#444;--cyan:#006a63;--pink:#9c1f58;--amber:#7a5400}}main{{padding:0}}}}</style></head><body><main><p class="eyebrow">Local metadata audit / schema {schema}</p><h1>Edit Trail report</h1><p class="meta">{query}. Indexed root: {root}. Generated from sidecar metadata only; no image pixels were read.</p><div class="stats"><strong>{count} records</strong><span>{sidecars} sidecars scanned</span><span>{warnings} warnings</span></div>{empty}<table><thead><tr><th>Source / sidecar</th><th>Editor</th><th>Active operations</th></tr></thead><tbody>{rows}</tbody></table></main></body></html>"#,
        query = html_escape(&query),
        schema = index.schema_version,
        root = html_escape(&index.root.to_string_lossy()),
        count = records.len(),
        sidecars = index.sidecars_seen,
        warnings = index.scan_warnings.len()
            + index
                .records
                .iter()
                .map(|r| r.warnings.len())
                .sum::<usize>(),
        empty = empty,
        rows = rows
    )
}

fn open_path(path: &Path) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let status = Command::new("explorer").arg(path).status();
    #[cfg(target_os = "macos")]
    let status = Command::new("open").arg(path).status();
    #[cfg(all(unix, not(target_os = "macos")))]
    let status = Command::new("xdg-open").arg(path).status();
    status
        .map_err(|error| format!("could not open {}: {error}", path.display()))
        .and_then(|status| {
            if status.success() {
                Ok(())
            } else {
                Err(format!("system opener failed for {}", path.display()))
            }
        })
}
