"use strict";

const fs = require("fs");
const { fileURLToPath } = require("url");

// Matches Node-style stack trace frames:
//   at Object.<anonymous> (/path/to/file.js:10:5)
//   at Module._compile (node:internal/modules/cjs/loader:1256:14)
//   at /path/to/file.js:10:5
//   at file:///path/to/file.js:10:5
//   at async Function.run (/path/to/file.js:12:3)
const FRAME_LINE_RE = /^\s*at\s+(?:async\s+)?(.+)$/;

function parseFrame(text) {
  let rest = String(text).trim();
  let fnName = null;

  // Function frames wrap the location in parentheses: fn (loc)
  if (rest.endsWith(")") && rest.includes(" (")) {
    const split = rest.lastIndexOf(" (");
    fnName = rest.slice(0, split).trim();
    rest = rest.slice(split + 2, -1).trim();
  }

  // Greedy match so Windows drive letters (C:\...) and node:internal paths
  // are captured correctly while still isolating the trailing :line:col.
  const locMatch = rest.match(/^(.+):(\d+):(\d+)$/);
  if (!locMatch) return null;

  return {
    function: fnName || null,
    file: locMatch[1],
    line: Number(locMatch[2]),
    column: Number(locMatch[3]),
  };
}

function parseStackTrace(errorString) {
  if (!errorString) return [];
  if (typeof errorString !== "string") errorString = String(errorString);

  const frames = [];
  for (const line of errorString.split(/\r?\n/)) {
    if (!FRAME_LINE_RE.test(line)) continue;
    const frame = parseFrame(line.replace(FRAME_LINE_RE, "$1"));
    if (frame) frames.push(frame);
  }
  return frames;
}

function isInternalFrame(file) {
  return (
    file.startsWith("node:") ||
    file.startsWith("internal/") ||
    file.startsWith("<") ||
    file === ""
  );
}

function sourceSnippet(filepath, line, radius = 2) {
  if (!filepath || typeof line !== "number" || line < 1) return null;
  if (isInternalFrame(filepath)) return null;

  let file = filepath;
  if (file.startsWith("file://")) {
    try {
      file = fileURLToPath(file);
    } catch {
      return null;
    }
  }

  let content;
  try {
    content = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }

  const lines = content.split(/\r?\n/);
  if (line > lines.length) return null;

  const start = Math.max(1, line - radius);
  const end = Math.min(lines.length, line + radius);

  return {
    file,
    line,
    start,
    end,
    lines: lines.slice(start - 1, end).map((text, i) => ({
      number: start + i,
      text,
      isErrorLine: start + i === line,
    })),
  };
}

module.exports = {
  parseStackTrace,
  parseFrame,
  sourceSnippet,
  isInternalFrame,
};
