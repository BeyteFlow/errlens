"use strict";

const { findError } = require("./matcher");
const { formatError } = require("./formatter");
const { resolveTheme } = require("./themes");
const chalkImport = require("chalk");
const chalk = chalkImport.default || chalkImport;

const themeName = process.env.ERRLENS_THEME || "default";
const verbose = process.env.ERRLENS_VERBOSE === "1";
const theme = resolveTheme(themeName);

process.on("uncaughtException", (err) => {
  const msg =
    err !== null && typeof err === "object"
      ? err.stack || err.message || String(err)
      : String(err ?? "unknown error");
  const { count, matches } = findError(msg);

  if (count > 0) {
    console.log(
      chalk[theme.infoLabel]( `\n💡 ErrLens detected ${count} issue(s):`)
    );
    matches.forEach((match) =>
      console.log(formatError(match, { theme: themeName, verbose }))
    );
  } else {
    console.error(chalk[theme.errorText].bold("\n--- Raw System Error ---"));
    console.error(err);
  }
  process.exit(1);
});
