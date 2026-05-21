export function syntaxHighlight(json: string): string {
  const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-orange-400";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "text-blue-300" : "text-green-400";
      } else if (/true|false/.test(match)) {
        cls = "text-purple-400";
      } else if (match === "null") {
        cls = "text-gray-400";
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export function getClaimDisplay(key: string, value: unknown): string {
  if ((key === "exp" || key === "nbf" || key === "iat") && typeof value === "number") {
    return new Date(value * 1000).toLocaleString();
  }

  return JSON.stringify(value);
}
