const chalk = require("chalk");
const boxen = require("boxen");

function formatError(error) {
  const fixList = error.fixes
    .map(fix => chalk.green(`  ✔ ${fix}`))
    .join("\n");

  const content = `
${chalk.cyan.bold("ID:")} ${error.name}

${chalk.yellow.bold("🔍 WHAT HAPPENED:")}
${error.explanation}

${chalk.magenta.bold("💥 WHY:")}
${error.why}

${chalk.green.bold("✅ COMMON FIXES:")}
${fixList}

${chalk.blue.bold("📘 EXAMPLE:")}
${chalk.gray(error.example)}
  `;

  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    title: "ErrLens Analysis",
    titleAlignment: "center"
  });
}

module.exports = { formatError };