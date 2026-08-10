"use strict";

const chalkImport = require("chalk");
const chalk = chalkImport.default || chalkImport;
const boxen = require("boxen");
const { resolveTheme } = require("./themes");

function formatError(error, options = {}) {
  const theme = resolveTheme(options.theme);
  const verbose = Boolean(options.verbose);

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
