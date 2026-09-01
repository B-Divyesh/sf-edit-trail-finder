# Demo sandbox

## Browser

Open <https://edit-trail-finder.sociobot.in/demo/> or choose **Try it with
sample data** on the first screen. `?demo=1` also redirects to this real demo
route. Three realistic XMP, DxO PhotoLab DOP, and PP3 sidecars are already in
memory. The default crop-and-denoise search already shows two files. **Reset demo**
restores and reruns the bundled sample. **View install options** leaves the
demo route and discards the sandbox.

If no sidecar is loaded, the result tells the visitor to paste sidecar data or
choose sidecar files before searching. Filter advice appears only when loaded
sidecars produce no matches.

The browser demo uses memory only. It does not use local storage or IndexedDB,
and selected sidecars are not uploaded. Closing the tab discards changes.

## CLI

The landing page includes a self-hosted terminal recording of the shipped
Linux binary running this command. Its transcript is available below the
recording. The build regenerates the SVG from a real run; only the temporary
directory name is shortened for display.

Run:

```sh
edit-trail demo
```

The command creates a unique directory under the operating system's temporary
directory. It writes a three-sidecar sample archive with a DxO PhotoLab DOP,
a JSON index, and a self-contained HTML report, then prints their paths. To choose a known fresh
directory for automated checks, run `edit-trail demo --output <DIRECTORY>
--json`. The command refuses to reuse an existing directory.

The source samples also ship under `examples/sample-archive/`.
