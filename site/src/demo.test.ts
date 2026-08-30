import { describe, expect, it } from "vitest";
import { filterRecords, isWellFormedXml, normalizeOperation, parseSidecars, SAMPLE } from "./demo";

describe("sidecar demo vocabulary", () => {
  it("matches the CLI's documented aliases", () => {
    expect(normalizeOperation("denoiseprofile")).toBe("denoise");
    expect(normalizeOperation("Rotate_and-perspective")).toBe("perspective");
  });

  it("supports all and any query combinations", () => {
    const records = [
      { name: "a.xmp", editor: "darktable", operations: ["crop", "denoise"] },
      { name: "b.xmp", editor: "darktable", operations: ["crop"] }
    ];
    expect(filterRecords(records, ["crop", "denoise"], "all")).toHaveLength(1);
    expect(filterRecords(records, ["crop", "denoise"], "any")).toHaveLength(2);
  });

  it("rejects malformed XML before the browser parser can create a parser-error document", () => {
    expect(isWellFormedXml('<?xml version="1.0"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><item crop="true" /></x:xmpmeta>')).toBe(true);
    expect(isWellFormedXml("<broken")).toBe(false);
    expect(isWellFormedXml("<sidecar><entry></sidecar>")).toBe(false);
    expect(isWellFormedXml("<rdf:Description />")).toBe(false);
    expect(isWellFormedXml("<sidecar value=\"a & b\" />")).toBe(false);
    expect(isWellFormedXml("<sidecar value=\"&#0;\" />")).toBe(false);
    expect(isWellFormedXml("<!DOCTYPE sidecar><sidecar />")).toBe(false);
  });

  it("accepts valid PP3 sections and rejects empty or arbitrary PP3 text", () => {
    expect(parseSidecars("--- FILE: valid.pp3\n[Crop]\nEnabled=true\n")).toEqual([
      { name: "valid.pp3", editor: "RawTherapee", operations: ["crop"] }
    ]);
    expect(() => parseSidecars("--- FILE: empty.pp3\n")).toThrow(/Could not parse empty\.pp3/);
    expect(() => parseSidecars("--- FILE: arbitrary.pp3\nThis is plain text, not a PP3 sidecar.\n")).toThrow(/Could not parse arbitrary\.pp3/);
  });

  it("extracts the documented sidecars without invoking DOMParser", () => {
    expect(globalThis.DOMParser).toBeUndefined();
    expect(parseSidecars(SAMPLE)).toEqual([
      { name: "night-market-1842.NEF.xmp", editor: "darktable", operations: ["crop", "denoise", "exposure", "masking"] },
      { name: "lantern-0917.ARW.dop", editor: "DxO PhotoLab", operations: ["crop", "denoise"] },
      { name: "after-rain-2201.RAF.pp3", editor: "RawTherapee", operations: ["color balance rgb", "crop"] }
    ]);
  });

  it("reads active and inactive corrections from a representative DxO DOP table", () => {
    const dxo = parseSidecars(SAMPLE).find((record) => record.name.endsWith(".dop"));
    expect(dxo).toEqual({
      name: "lantern-0917.ARW.dop",
      editor: "DxO PhotoLab",
      operations: ["crop", "denoise"]
    });
    expect(dxo?.operations).not.toContain("exposure");
    expect(dxo?.operations).not.toContain("masking");
  });
});
