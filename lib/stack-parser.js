"use strict";

const fs = require("fs");
const path = require("path");
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

  // Function frames wrap the location in parentheses: fn (loc). The location
  // itself may contain parens (e.g. "C:\dir (copy)\file.js:1:1"), so match the
  // opening paren that corresponds to the final closing paren instead of using
  // a naive lastIndexOf(" (").
  if (rest.endsWith(")")) {
    let depth = 0;
    for (let i = rest.length - 1; i >= 0; i--) {
      const ch = rest[i];
      if (ch === ")") depth++;
      else if (ch === "(") {
        depth--;
        if (depth === 0) {
          fnName = rest.slice(0, i).trim();
          rest = rest.slice(i + 1, -1).trim();
          break;
        }
      }
    }
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

// Files larger than this are skipped to avoid reading huge sources into memory.
const MAX_SNIPPET_SIZE = 256 * 1024; // 256 KiB

// Resolve a stack-derived path (which may be attacker-controlled) and confine
// it to the current working directory. Returns a canonical absolute path or
// null when the target is not safe to read.
function resolveSafePath(filepath) {
  let file = filepath;
  if (file.startsWith("file://")) {
    try {
      file = fileURLToPath(file);
    } catch {
      return null;
    }
  }

  const root = path.resolve(process.cwd());
  const resolved = path.resolve(file);

  // Reject paths that escape the approved source root.
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }

  // Resolve symlinks and reject escapes through them.
  let real;
  let realRoot;
  try {
    real = fs.realpathSync(resolved);
    realRoot = fs.realpathSync(root);
  } catch {
    return null;
  }
  if (real !== realRoot && !real.startsWith(realRoot + path.sep)) {
    return null;
  }

  // Reject non-regular files (directories, devices, sockets, etc.).
  let stat;
  try {
    stat = fs.statSync(real);
  } catch {
    return null;
  }
  if (!stat.isFile() || stat.size > MAX_SNIPPET_SIZE) return null;

  return real;
}

function sourceSnippet(filepath, line, radius = 2) {
  if (!filepath || typeof line !== "number" || line < 1) return null;
  if (isInternalFrame(filepath)) return null;

  const file = resolveSafePath(filepath);
  if (!file) return null;

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
