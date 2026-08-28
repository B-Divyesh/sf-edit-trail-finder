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

type XmlAttribute = { name: string; localName: string; value: string };
type XmlElement = { name: string; localName: string; namespaces: Map<string, string>; attributes: XmlAttribute[] };

function isXmlCharacter(codePoint: number): boolean {
  return codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d
    || (codePoint >= 0x20 && codePoint <= 0xd7ff)
    || (codePoint >= 0xe000 && codePoint <= 0xfffd)
    || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
}

function decodeXmlValue(value: string): string | undefined {
  const replacements: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", quot: "\"" };
  let decoded = "";
  let position = 0;

  while (position < value.length) {
    const entityStart = value.indexOf("&", position);
    if (entityStart === -1) return decoded + value.slice(position);
    decoded += value.slice(position, entityStart);
    const entityEnd = value.indexOf(";", entityStart + 1);
    if (entityEnd === -1) return undefined;
    const entity = value.slice(entityStart + 1, entityEnd);
    if (entity in replacements) {
      decoded += replacements[entity];
    } else {
      const numeric = /^#([0-9]+)$/.exec(entity)?.[1];
      const hexadecimal = /^#x([0-9a-fA-F]+)$/.exec(entity)?.[1];
      const codePoint = numeric ? Number.parseInt(numeric, 10) : hexadecimal ? Number.parseInt(hexadecimal, 16) : Number.NaN;
      if (!Number.isSafeInteger(codePoint) || !isXmlCharacter(codePoint)) return undefined;
      decoded += String.fromCodePoint(codePoint);
    }
    position = entityEnd + 1;
  }
  return decoded;
}

function prefixOf(name: string): string | undefined {
  const separator = name.indexOf(":");
  return separator === -1 ? undefined : name.slice(0, separator);
}

function localNameOf(name: string): string {
  return name.slice(name.indexOf(":") + 1);
}

/**
 * Parse the conservative XML subset used by XMP sidecars without DOMParser.
 * Chromium builds a styled parser-error document for malformed XML, which a
 * strict CSP correctly rejects with console errors. Keeping both validation
 * and extraction here means malformed input can never create that document.
 */
function parseXmlElements(input: string): XmlElement[] | undefined {
  const xml = input.trim();
  if (!xml || [...xml].some((character) => !isXmlCharacter(character.codePointAt(0) ?? 0))) return undefined;

  const stack: XmlElement[] = [];
  const parsedElements: XmlElement[] = [];
  const initialNamespaces = new Map([["xml", "http://www.w3.org/XML/1998/namespace"]]);
  let position = 0;
  let rootCount = 0;
  let sawDeclaration = false;

  while (position < xml.length) {
    const nextTag = xml.indexOf("<", position);
    if (nextTag === -1) {
      const text = xml.slice(position);
      if (stack.length === 0 ? text.trim() !== "" : text.includes("]]>") || decodeXmlValue(text) === undefined) return undefined;
      position = xml.length;
      break;
    }

    const text = xml.slice(position, nextTag);
    if (text.includes("]]>") || decodeXmlValue(text) === undefined || (stack.length === 0 && text.trim())) return undefined;
    position = nextTag;

    if (xml.startsWith("<!--", position)) {
      const end = xml.indexOf("-->", position + 4);
      if (end === -1 || xml.slice(position + 4, end).includes("--")) return undefined;
      position = end + 3;
      continue;
    }

    if (xml.startsWith("<![CDATA[", position)) {
      const end = xml.indexOf("]]>", position + 9);
      if (end === -1 || stack.length === 0) return undefined;
      position = end + 3;
      continue;
    }

    if (xml.startsWith("<?", position)) {
      const end = xml.indexOf("?>", position + 2);
      if (end === -1) return undefined;
      const instruction = xml.slice(position, end + 2);
      const target = /^<\?([A-Za-z_][A-Za-z0-9_.:-]*)/.exec(instruction)?.[1];
      if (!target) return undefined;
      if (target.toLowerCase() === "xml") {
        if (position !== 0 || sawDeclaration || rootCount > 0 || !xmlDeclaration.test(instruction)) return undefined;
        sawDeclaration = true;
      }
      position = end + 2;
      continue;
    }

    // The demo does not need DTDs or entity declarations. Rejecting them also
    // prevents parser-specific recovery for input outside supported sidecars.
    if (xml.startsWith("<!", position)) return undefined;

    if (xml.startsWith("</", position)) {
      const closing = new RegExp(`^</(${xmlName.source.slice(1)})\\s*>`).exec(xml.slice(position));
      if (!closing || stack.pop()?.name !== closing[1]) return undefined;
      position += closing[0].length;
      continue;
    }

    const opening = xmlName.exec(xml.slice(position + 1));
    if (!opening) return undefined;
    const name = opening[0];
    position += name.length + 1;
    const attributes: XmlAttribute[] = [];
    const seenAttributes = new Set<string>();
    let selfClosing = false;
    let closedStartTag = false;

    while (position < xml.length) {
      const beforeWhitespace = position;
      while (/\s/.test(xml[position] ?? "")) position += 1;
      if (xml.startsWith("/>", position)) { selfClosing = true; closedStartTag = true; position += 2; break; }
      if (xml[position] === ">") { closedStartTag = true; position += 1; break; }
      if (position === beforeWhitespace) return undefined;

      const attribute = xmlName.exec(xml.slice(position));
      if (!attribute || seenAttributes.has(attribute[0])) return undefined;
      seenAttributes.add(attribute[0]);
      position += attribute[0].length;
      while (/\s/.test(xml[position] ?? "")) position += 1;
      if (xml[position] !== "=") return undefined;
      position += 1;
      while (/\s/.test(xml[position] ?? "")) position += 1;
      const quote = xml[position];
      if (quote !== '"' && quote !== "'") return undefined;
      const valueStart = ++position;
      const valueEnd = xml.indexOf(quote, valueStart);
      if (valueEnd === -1) return undefined;
      const rawValue = xml.slice(valueStart, valueEnd);
      const value = decodeXmlValue(rawValue);
      if (rawValue.includes("<") || value === undefined) return undefined;
      attributes.push({ name: attribute[0], localName: localNameOf(attribute[0]), value });
      position = valueEnd + 1;
    }

    if (!closedStartTag || rootCount > 0 && stack.length === 0) return undefined;
    const namespaces = new Map(stack.at(-1)?.namespaces ?? initialNamespaces);
    for (const attribute of attributes) {
      if (attribute.name === "xmlns") namespaces.set("", attribute.value);
      if (attribute.name.startsWith("xmlns:")) {
        const prefix = attribute.name.slice("xmlns:".length);
        if (prefix === "xmlns" || !attribute.value) return undefined;
        if (prefix === "xml" && attribute.value !== initialNamespaces.get("xml")) return undefined;
        namespaces.set(prefix, attribute.value);
      }
    }
    const elementPrefix = prefixOf(name);
    if (elementPrefix && !namespaces.has(elementPrefix)) return undefined;
    if (attributes.some((attribute) => {
      const prefix = prefixOf(attribute.name);
      return prefix && prefix !== "xmlns" && !namespaces.has(prefix);
    })) return undefined;

    const expandedAttributes = new Set<string>();
    for (const attribute of attributes.filter(({ name }) => name !== "xmlns" && !name.startsWith("xmlns:"))) {
      const prefix = prefixOf(attribute.name);
      const expandedName = `${prefix ? namespaces.get(prefix) : ""}|${attribute.localName}`;
      if (expandedAttributes.has(expandedName)) return undefined;
      expandedAttributes.add(expandedName);
    }

    if (stack.length === 0) rootCount += 1;
    const element = { name, localName: localNameOf(name), namespaces, attributes };
    parsedElements.push(element);
    if (!selfClosing) stack.push(element);
  }

  return stack.length === 0 && rootCount === 1 ? parsedElements : undefined;
}

export function isWellFormedXml(input: string): boolean {
  return parseXmlElements(input) !== undefined;
}

export function parseSidecars(input: string): DemoRecord[] {
  if (!input.trim()) return [];
  return splitDocuments(input).map(({ name, xml }) => {
    const elements = parseXmlElements(xml);
    if (!elements) throw new Error(`Could not parse ${name}. Check that its XML is complete.`);
    const operations = new Set<string>();
    let editor = "Generic XMP";
    const description = elements.find((element) => element.localName === "Description");
    const historyEnd = Number.parseInt(description?.attributes.find((attribute) => attribute.localName === "history_end")?.value ?? "", 10);

    for (const element of elements) {
      const attrs = element.attributes;
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
