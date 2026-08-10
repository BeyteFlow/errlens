"use strict";

const { findError } = require("./matcher");
const { formatError } = require("./formatter");
const { resolveTheme } = require("./themes");
const chalkImport = require("chalk");
const chalk = chalkImport.default || chalkImport;

const themeName = process.env.ERRLENS_THEME || "default";
const verbose = process.env.ERRLENS_VERBOSE === "1";
const theme = resolveTheme(themeName);

function safeStringify(value) {
  try {
    if (value !== null && typeof value === "object") {
      return value.stack || value.message || String(value);
    }
    return String(value ?? "unknown error");
  } catch {
    return "unknown error";
  }
}

process.on("uncaughtException", (err) => {
  const errStr = safeStringify(err);
  const { count, matches } = findError(errStr);

  if (count > 0) {
    console.log(
      chalk[theme.infoLabel].bold(
        `\n💡 ErrLens Runtime Analysis (${count} Issues Found):`
      )
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

process.on("unhandledRejection", (reason) => {
  const reasonStr = safeStringify(reason);
  const { count, matches } = findError(reasonStr);

  if (count > 0) {
    console.log(
      chalk[theme.asyncLabel].bold(
        `\n📡 ErrLens Async Error Detection:`
      )
    );
    matches.forEach((match) =>
      console.log(formatError(match, { theme: themeName, verbose }))
    );
  } else {
    console.error(
      chalk[theme.errorText].bold("\n--- Unhandled Async Rejection ---")
    );
    console.error(reason);
  }
  process.exit(1);
});

console.log(chalk[theme.protectionText]("🔧 ErrLens Protection Enabled."));
