# Demo sandbox

## Browser

Open <https://edit-trail-finder.sociobot.in/?demo=1#demo> or choose **Try it
with sample data** on the first screen. Three realistic sidecars are already in
memory. The default crop-and-denoise search returns two files. **Reset demo**
restores the bundled sample. **Start for real** returns to the install options.

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
