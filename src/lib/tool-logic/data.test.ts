import { describe, expect, it } from "vitest";
import { csvToJson, formatJson, jsonToCsv, jsonToYaml, yamlToJson } from "@/lib/tool-logic/data";

describe("data helpers", () => {
  it("formats, minifies, and repairs JSON", () => {
    expect(formatJson('{"name":"Alice","active":true}', "format")).toEqual({
      ok: true,
      value: '{\n  "name": "Alice",\n  "active": true\n}',
      meta: { repaired: false },
    });
    expect(formatJson('{"name":"Alice"}', "minify")).toEqual({
      ok: true,
      value: '{"name":"Alice"}',
      meta: { repaired: false },
    });
    expect(formatJson("{name:'Alice'}", "format")).toEqual({
      ok: true,
      value: '{\n  "name": "Alice"\n}',
      meta: { repaired: true },
    });
  });

  it("reports invalid JSON when repair fails", () => {
    const result = formatJson("}{", "format");
    expect(result.ok).toBe(false);
  });

  it("converts YAML and JSON", () => {
    expect(yamlToJson("name: Alice\nage: 30")).toEqual({
      ok: true,
      value: '{\n  "name": "Alice",\n  "age": 30\n}',
    });
    expect(jsonToYaml('{"name":"Alice","age":30}')).toEqual({
      ok: true,
      value: "name: Alice\nage: 30\n",
    });
    expect(jsonToYaml("{")).toMatchObject({ ok: false });
  });

  it("converts CSV to JSON with and without headers", () => {
    expect(csvToJson("name,age\nAlice,30", true)).toEqual({
      ok: true,
      value: '[\n  {\n    "name": "Alice",\n    "age": 30\n  }\n]',
    });
    expect(csvToJson("Alice,30", false)).toEqual({
      ok: true,
      value: '[\n  [\n    "Alice",\n    30\n  ]\n]',
    });
  });

  it("converts JSON arrays to CSV and rejects non-arrays", () => {
    expect(jsonToCsv('[{"name":"Alice","age":30},{"name":"Bob","age":25}]')).toEqual({
      ok: true,
      value: "name,age\r\nAlice,30\r\nBob,25",
    });
    expect(jsonToCsv('{"name":"Alice"}')).toEqual({ ok: false, error: "Input must be a JSON array" });
  });
});
