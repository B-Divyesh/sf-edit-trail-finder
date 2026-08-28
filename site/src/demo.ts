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

const xmlName = /^[A-Za-z_][A-Za-z0-9_.-]*(?::[A-Za-z_][A-Za-z0-9_.-]*)?/;
const xmlDeclaration = /^<\?xml\s+version=(['"])1\.[0-9]\1(?:\s+encoding=(['"])[A-Za-z][A-Za-z0-9._-]*\2)?(?:\s+standalone=(['"])(?:yes|no)\3)?\s*\?>$/;

type XmlElement = { name: string; namespaces: Map<string, string> };

function entitiesAreValid(value: string): boolean {
  let index = value.indexOf("&");
  while (index !== -1) {
    const end = value.indexOf(";", index + 1);
    if (end === -1) return false;
    const entity = value.slice(index + 1, end);
    if (!/^(?:amp|apos|gt|lt|quot|#[0-9]+|#x[0-9a-fA-F]+)$/.test(entity)) return false;
    index = value.indexOf("&", end + 1);
  }
  return true;
}

function prefixOf(name: string): string | undefined {
  const separator = name.indexOf(":");
  return separator === -1 ? undefined : name.slice(0, separator);
}

/**
 * Reject malformed XML before DOMParser sees it. Chromium builds a styled
 * parser-error document for malformed XML; strict CSP correctly blocks those
 * generated inline styles and reports console errors. This small, conservative
 * well-formedness check supports the XMP subset used by the local demo and
 * treats anything ambiguous as malformed without parsing it in the browser.
 */
export function isWellFormedXml(input: string): boolean {
  const xml = input.trim();
  if (!xml || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(xml)) return false;

  const elements: XmlElement[] = [];
  const initialNamespaces = new Map([["xml", "http://www.w3.org/XML/1998/namespace"]]);
  let position = 0;
  let rootCount = 0;
  let sawDeclaration = false;

  while (position < xml.length) {
    const nextTag = xml.indexOf("<", position);
    if (nextTag === -1) {
      const text = xml.slice(position);
      return elements.length === 0
        ? text.trim() === "" && rootCount === 1
        : !text.includes("]]>") && entitiesAreValid(text) && rootCount === 1;
    }

    const text = xml.slice(position, nextTag);
    if (text.includes("]]>") || !entitiesAreValid(text) || (elements.length === 0 && text.trim())) return false;
    position = nextTag;

    if (xml.startsWith("<!--", position)) {
      const end = xml.indexOf("-->", position + 4);
      if (end === -1 || xml.slice(position + 4, end).includes("--")) return false;
      position = end + 3;
      continue;
    }

    if (xml.startsWith("<![CDATA[", position)) {
      const end = xml.indexOf("]]>", position + 9);
      if (end === -1 || elements.length === 0) return false;
      position = end + 3;
      continue;
    }

    if (xml.startsWith("<?", position)) {
      const end = xml.indexOf("?>", position + 2);
      if (end === -1) return false;
      const instruction = xml.slice(position, end + 2);
      const target = /^<\?([A-Za-z_][A-Za-z0-9_.:-]*)/.exec(instruction)?.[1];
      if (!target) return false;
      if (target.toLowerCase() === "xml") {
        if (position !== 0 || sawDeclaration || rootCount > 0 || !xmlDeclaration.test(instruction)) return false;
        sawDeclaration = true;
      }
      position = end + 2;
      continue;
    }

    // The demo does not need DTDs or entity declarations. Rejecting them also
    // prevents parser-specific recovery for input outside supported sidecars.
    if (xml.startsWith("<!", position)) return false;

    if (xml.startsWith("</", position)) {
      const closing = new RegExp(`^</(${xmlName.source.slice(1)})\\s*>`).exec(xml.slice(position));
      if (!closing || elements.pop()?.name !== closing[1]) return false;
      position += closing[0].length;
      continue;
    }

    const opening = xmlName.exec(xml.slice(position + 1));
    if (!opening) return false;
    const name = opening[0];
    position += name.length + 1;
    const attributes: { name: string; value: string }[] = [];
    const seenAttributes = new Set<string>();
    let selfClosing = false;
    let closedStartTag = false;

    while (position < xml.length) {
      const beforeWhitespace = position;
      while (/\s/.test(xml[position] ?? "")) position += 1;
      if (xml.startsWith("/>", position)) { selfClosing = true; closedStartTag = true; position += 2; break; }
      if (xml[position] === ">") { closedStartTag = true; position += 1; break; }
      if (position === beforeWhitespace) return false;

      const attribute = xmlName.exec(xml.slice(position));
      if (!attribute || seenAttributes.has(attribute[0])) return false;
      seenAttributes.add(attribute[0]);
      position += attribute[0].length;
      while (/\s/.test(xml[position] ?? "")) position += 1;
      if (xml[position] !== "=") return false;
      position += 1;
      while (/\s/.test(xml[position] ?? "")) position += 1;
      const quote = xml[position];
      if (quote !== '"' && quote !== "'") return false;
      const valueStart = ++position;
      const valueEnd = xml.indexOf(quote, valueStart);
      if (valueEnd === -1) return false;
      const value = xml.slice(valueStart, valueEnd);
      if (value.includes("<") || !entitiesAreValid(value)) return false;
      attributes.push({ name: attribute[0], value });
      position = valueEnd + 1;
    }

    if (!closedStartTag || rootCount > 0 && elements.length === 0) return false;
    const namespaces = new Map(elements.at(-1)?.namespaces ?? initialNamespaces);
    for (const attribute of attributes) {
      if (attribute.name === "xmlns") namespaces.set("", attribute.value);
      if (attribute.name.startsWith("xmlns:")) {
        const prefix = attribute.name.slice("xmlns:".length);
        if (prefix === "xml" || prefix === "xmlns" || !attribute.value) return false;
        namespaces.set(prefix, attribute.value);
      }
    }
    const elementPrefix = prefixOf(name);
    if (elementPrefix && !namespaces.has(elementPrefix)) return false;
    if (attributes.some((attribute) => {
      const prefix = prefixOf(attribute.name);
      return prefix && prefix !== "xmlns" && !namespaces.has(prefix);
    })) return false;

    if (elements.length === 0) rootCount += 1;
    if (!selfClosing) elements.push({ name, namespaces });
  }

  return elements.length === 0 && rootCount === 1;
}

export function parseSidecars(input: string): DemoRecord[] {
  if (!input.trim()) return [];
  return splitDocuments(input).map(({ name, xml }) => {
    if (!isWellFormedXml(xml)) throw new Error(`Could not parse ${name}. Check that its XML is complete.`);
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
