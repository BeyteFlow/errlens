"use strict";

const chalkImport = require("chalk");
const chalk = chalkImport.default || chalkImport;
const boxen = require("boxen");
const { resolveTheme } = require("./themes");
const { sourceSnippet, isInternalFrame } = require("./stack-parser");

function formatLocation(location) {
  const fn = location.function ? `${location.function} (` : "";
  const close = location.function ? ")" : "";
  return `${fn}${location.file}:${location.line}:${location.column}${close}`;
}

function formatSnippet(snippet, theme) {
  if (!snippet) return null;

  const lines = snippet.lines
    .map((line) => {
      const gutter = line.isErrorLine
        ? chalk[theme.signalText].bold(`${line.number} >`)
        : chalk[theme.exampleCode](`${line.number}  `);
      const code = line.isErrorLine
        ? chalk[theme.errorText](line.text)
        : chalk[theme.exampleCode](line.text);
      return `${gutter} ${code}`;
    })
    .join("\n");

  return `${chalk[theme.infoLabel].bold("📍 CONTEXT:")} ${chalk[theme.exampleCode](
    snippet.file
  )}:${snippet.line}\n${lines}`;
}

function formatError(error, options = {}) {
  const theme = resolveTheme(options.theme);
  const verbose = Boolean(options.verbose);
  const locations = Array.isArray(options.locations) ? options.locations : [];

  const fixList = error.fixes
    .map((f) => chalk[theme.fixCheck](`  ✔ ${f}`))
    .join("\n");

  const explanationBlock = `
${chalk[theme.whatLabel].bold("🔍 WHAT:")} ${error.explanation}`;

  const whyBlock = `
${chalk[theme.whyLabel].bold("💥 WHY:")} ${error.why}`;

  const fixesBlock = `
${chalk[theme.fixesLabel].bold("✅ FIXES:")}
${fixList}`;

  const exampleBlock = `
${chalk[theme.exampleLabel].bold("📘 EXAMPLE:")}
${chalk[theme.exampleCode](error.example)}`;

  let content = `
${chalk[theme.id].bold("ID:")} ${error.name}
${explanationBlock}
${whyBlock}
${fixesBlock}
${exampleBlock}`;

  if (verbose) {
    const matchBlock = `
${chalk[theme.id].bold("🔎 MATCH:")} ${chalk[theme.exampleCode](error.matchedText || error.match)}`;

    const metaBlock = `
${chalk[theme.id].bold("📏 LENGTH:")} ${(error.matchedText || error.match).length} chars
${chalk[theme.id].bold("🏷️  KEY:")} ${error.match}`;

    content += matchBlock + metaBlock;
  }

  if (locations.length > 0) {
    const appFrames = locations.filter((l) => !isInternalFrame(l.file));
    const frame = appFrames[0] || locations[0];

    const locationBlock = `
${chalk[theme.infoLabel].bold("📍 LOCATION:")} ${chalk[theme.exampleCode](
      formatLocation(frame)
    )}`;
    content += locationBlock;

    if (options.context) {
      const snippet = sourceSnippet(frame.file, frame.line, 2);
      const snippetBlock = formatSnippet(snippet, theme);
      if (snippetBlock) {
        content += `\n${snippetBlock}`;
      }
    }
  }

  return boxen(content, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: "round",
    borderColor: theme.border,
    title: chalk[theme.title].bold("🔍 ErrLens Analysis"),
    titleAlignment: "left",
    width: 80,
  });
}

module.exports = { formatError };
