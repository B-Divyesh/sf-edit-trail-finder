import { describe, expect, it } from "vitest";
import { filterRecords, normalizeOperation } from "./demo";

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
});
