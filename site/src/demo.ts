export type DemoRecord = {
  name: string;
  editor: string;
  operations: string[];
};

const aliases: Record<string, string> = {
  denoiseprofile: "denoise",
  "noise reduction": "denoise",
  "raw denoise": "denoise",
  "rotate and perspective": "perspective",
  "local adjustments": "masking",
  "mask manager": "masking",
  lensfun: "lens correction"
};

export const SAMPLE = `--- FILE: night-market-1842.NEF.xmp
<x:xmpmeta xmlns:x="adobe:ns:meta/" xmlns:rdf="rdf" xmlns:darktable="darktable">
  <rdf:Description darktable:history_end="5">
    <darktable:history><rdf:Seq>
      <rdf:li darktable:num="0" darktable:operation="exposure" darktable:enabled="1" />
      <rdf:li darktable:num="1" darktable:operation="denoiseprofile" darktable:enabled="1" />
      <rdf:li darktable:num="2" darktable:operation="crop" darktable:enabled="1" />
      <rdf:li darktable:num="3" darktable:operation="mask manager" darktable:enabled="1" />
      <rdf:li darktable:num="4" darktable:operation="contrast" darktable:enabled="0" />
    </rdf:Seq></darktable:history>
  </rdf:Description>
</x:xmpmeta>
--- FILE: lantern-0917.ARW.xmp
<x:xmpmeta xmlns:x="adobe:ns:meta/" xmlns:rdf="rdf" xmlns:crs="camera-raw">
  <rdf:Description crs:HasCrop="True" crs:LuminanceSmoothing="28" crs:Exposure2012="0.45">
    <crs:MaskGroupBasedCorrections />
  </rdf:Description>
</x:xmpmeta>
--- FILE: after-rain-2201.RAF.xmp
<x:xmpmeta xmlns:x="adobe:ns:meta/" xmlns:rdf="rdf" xmlns:darktable="darktable">
  <rdf:Description darktable:history_end="2">
    <rdf:li darktable:num="0" darktable:operation="color balance rgb" darktable:enabled="1" />
    <rdf:li darktable:num="1" darktable:operation="crop" darktable:enabled="1" />
  </rdf:Description>
</x:xmpmeta>`;

export function normalizeOperation(value: string): string {
  const clean = value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  return aliases[clean] ?? clean;
}

function truthy(value: string): boolean {
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function activeNumber(value: string): boolean {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) && Math.abs(number) > Number.EPSILON;
}

function splitDocuments(input: string): { name: string; xml: string }[] {
  const marker = /^---\s*FILE:\s*(.+)$/gm;
  const matches = [...input.matchAll(marker)];
  if (matches.length === 0) return [{ name: "pasted-sidecar.xmp", xml: input.trim() }];
  return matches.map((match, index) => ({
    name: match[1].trim(),
    xml: input.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? input.length).trim()
  }));
}

export function parseSidecars(input: string): DemoRecord[] {
  if (!input.trim()) return [];
  return splitDocuments(input).map(({ name, xml }) => {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) throw new Error(`Could not parse ${name}. Check that its XML is complete.`);
    const operations = new Set<string>();
    let editor = "Generic XMP";
    const description = [...document.querySelectorAll("*")].find((node) => node.localName === "Description");
    const historyEnd = Number.parseInt([...description?.attributes ?? []].find((attr) => attr.localName === "history_end")?.value ?? "", 10);

    for (const element of document.querySelectorAll("*")) {
      const attrs = [...element.attributes];
      const operation = attrs.find((attr) => ["operation", "module", "tool"].includes(attr.localName));
      const enabled = attrs.find((attr) => ["enabled", "active", "applied"].includes(attr.localName));
      const step = Number.parseInt(attrs.find((attr) => ["num", "index", "step"].includes(attr.localName))?.value ?? "", 10);
      if (operation && (!enabled || truthy(enabled.value)) && (!Number.isFinite(historyEnd) || !Number.isFinite(step) || step < historyEnd)) {
        operations.add(normalizeOperation(operation.value));
        editor = "darktable";
      }
      for (const attr of attrs) {
        const key = attr.localName.toLowerCase();
        const active = truthy(attr.value) || activeNumber(attr.value);
        if (key === "hascrop" && truthy(attr.value)) operations.add("crop");
        if ((key.includes("luminancesmoothing") || key.includes("colornoisereduction") || key.includes("denoise")) && active) operations.add("denoise");
        if ((key.includes("maskgroup") || key.includes("correctionmask")) && active) operations.add("masking");
        if (key.includes("exposure") && active) operations.add("exposure");
      }
      const elementName = element.localName.toLowerCase();
      if (elementName.includes("maskgroup") || elementName.includes("correctionmask")) operations.add("masking");
    }
    if (editor === "Generic XMP" && operations.size > 0) editor = "Adobe Camera Raw / Lightroom";
    return { name, editor, operations: [...operations].sort() };
  });
}

export function filterRecords(records: DemoRecord[], selected: string[], mode: "all" | "any"): DemoRecord[] {
  if (selected.length === 0) return records;
  return records.filter((record) => mode === "all"
    ? selected.every((operation) => record.operations.includes(operation))
    : selected.some((operation) => record.operations.includes(operation)));
}
