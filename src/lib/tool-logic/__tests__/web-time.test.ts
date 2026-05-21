import { describe, expect, it } from "vitest";
import { formatWithGmt, parseCronExpression, parseUnixInput, parseUrl } from "@/lib/tool-logic/web-time";

describe("web and time helpers", () => {
  it("parses detailed URLs", () => {
    expect(parseUrl("https://user:pass@example.com:8080/api?role=admin&active=true#results")).toEqual({
      ok: true,
      value: {
        protocol: "https:",
        username: "user",
        password: "pass",
        host: "example.com:8080",
        hostname: "example.com",
        port: "8080",
        pathname: "/api",
        search: "?role=admin&active=true",
        hash: "#results",
        params: [["role", "admin"], ["active", "true"]],
      },
    });
  });

  it("reports invalid URLs", () => {
    expect(parseUrl("not a url")).toEqual({ ok: false, error: "Invalid URL" });
  });

  it("parses cron expressions with deterministic next runs", () => {
    const result = parseCronExpression("0 9 * * 1", new Date("2024-01-01T00:00:00.000Z"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.description).toContain("Monday");
      expect(result.value.nextRuns).toHaveLength(5);
      expect(result.value.nextRuns[0]).toBeInstanceOf(Date);
    }
  });

  it("rejects invalid cron expressions", () => {
    expect(parseCronExpression("bad cron").ok).toBe(false);
  });

  it("parses unix seconds, milliseconds, and ISO strings", () => {
    expect(parseUnixInput("1700000000")?.unix()).toBe(1700000000);
    expect(parseUnixInput("1700000000000")?.valueOf()).toBe(1700000000000);
    expect(parseUnixInput("2023-11-14T22:13:20.000Z")?.unix()).toBe(1700000000);
    expect(parseUnixInput("invalid")).toBeNull();
  });

  it("formats GMT offsets", () => {
    const date = parseUnixInput("1700000000");
    expect(date ? formatWithGmt(date) : "").toMatch(/GMT [+-]\d/);
  });

  it("returns error for empty URL", () => {
    expect(parseUrl("")).toEqual({ ok: false, error: "Invalid URL" });
  });

  it("returns null for empty unix input", () => {
    expect(parseUnixInput("")).toBeNull();
    expect(parseUnixInput("   ")).toBeNull();
  });

  it("parses URL with no auth, port, or query", () => {
    expect(parseUrl("https://example.com/path")).toMatchObject({
      ok: true,
      value: {
        protocol: "https:",
        username: "",
        password: "",
        port: "",
        pathname: "/path",
        search: "",
        hash: "",
        params: [],
      },
    });
  });

  it("parseUnixInput returns null for overflow number (invalid date)", () => {
    // Number("1".repeat(40)) = Infinity → dayjs(Infinity).isValid() = false
    expect(parseUnixInput("1".repeat(40))).toBeNull();
  });

  it("formatWithGmt formats negative UTC offset with minus sign", async () => {
    const dayjs = (await import("dayjs")).default;
    const date = dayjs("2023-11-14T22:13:20.000Z").utcOffset(-300);
    const result = formatWithGmt(date);
    expect(result).toMatch(/GMT -/);
  });

  it("formatWithGmt formats offset with non-zero minutes (colon form)", async () => {
    const dayjs = (await import("dayjs")).default;
    const date = dayjs("2023-11-14T22:13:20.000Z").utcOffset(330); // +5:30
    const result = formatWithGmt(date);
    expect(result).toMatch(/GMT \+5:30/);
  });
});
