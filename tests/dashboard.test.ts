import { describe, it, expect } from "vitest";
import {
  decodeDashboard,
  encodeDashboard,
  defaultWidget,
  embedSnippet,
} from "../lib/dashboard";
import { demoQuery } from "../lib/query";
const spec = {
  version: 1,
  network: "tiramisu",
  title: "Test dashboard",
  description: "Offline fixture",
  query: demoQuery,
  widgets: [defaultWidget],
  refreshSeconds: 60,
  createdAt: "2026-10-14T12:00:00.000Z",
};
describe("dashboard contract (offline)", () => {
  it("round trips validated UTF-8 payloads", () =>
    expect(decodeDashboard(encodeDashboard(spec))).toEqual(spec));
  it("rejects executable/unknown fields", () =>
    expect(() =>
      encodeDashboard({ ...spec, html: "<script>alert(1)</script>" }),
    ).toThrow());
  it("rejects unsupported version, excessive polling and duplicate ids", () => {
    expect(() => encodeDashboard({ ...spec, version: 2 })).toThrow();
    expect(() => encodeDashboard({ ...spec, refreshSeconds: 1 })).toThrow();
    expect(() =>
      encodeDashboard({ ...spec, widgets: [defaultWidget, defaultWidget] }),
    ).toThrow();
  });
  it("rejects malformed and oversized public payloads", () => {
    expect(() => decodeDashboard(new Uint8Array(32769))).toThrow();
    expect(() => decodeDashboard(new TextEncoder().encode("{bad}"))).toThrow();
  });
  it("builds a safe iframe", () => {
    const key = "0x" + "a".repeat(64);
    expect(embedSnippet("https://example.com", key, "overview")).toContain(
      `/embed/${key}?widget=overview`,
    );
    expect(() => embedSnippet("javascript:alert(1)", key)).toThrow();
    expect(() =>
      embedSnippet("https://example.com", key, '" onload="alert(1)'),
    ).toThrow();
  });
});
