# Demo sandbox

## Browser

Open <https://edit-trail-finder.sociobot.in/demo/> or choose **Try it with
sample data** on the first screen. `?demo=1` also redirects to this real demo
route. Three realistic XMP, DOP, and PP3 sidecars are already in memory. The
default crop-and-denoise search already shows two files. **Reset demo**
restores and reruns the bundled sample. **View install options** leaves the
demo route and discards the sandbox.

The browser demo uses memory only. It does not use local storage or IndexedDB,
and selected sidecars are not uploaded. Closing the tab discards changes.

## CLI

Run:

```sh
edit-trail demo
```

The command creates a unique directory under the operating system's temporary
directory. It writes a three-sidecar sample archive, a JSON index, and a
self-contained HTML report, then prints their paths. To choose a known fresh
directory for automated checks, run `edit-trail demo --output <DIRECTORY>
--json`. The command refuses to reuse an existing directory.

The source samples also ship under `examples/sample-archive/`.
