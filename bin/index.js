#!/usr/bin/env node

"use strict";

const { Command } = require("commander");
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");
const { THEME_NAMES, isValidTheme, resolveTheme } = require("../lib/themes");
const { version } = require("../package.json");

const program = new Command();

program
  .name("errlens")
  .description("Professional JS Error Analytics")
  .version(version)
  .option("--json", "Output JSON instead of pretty UI")
  .option(
    "--theme <name>",
    `Color theme (${THEME_NAMES.join(", ")})`,
    "default"
  )
  .option("--verbose", "Show extra diagnostic info for each match");

// ----------------- HELPERS -----------------
function validateTheme(name) {
  if (name && !isValidTheme(name)) {
    console.error(
      `Unknown theme "${name}". Available: ${THEME_NAMES.join(", ")}`
    );
    process.exit(1);
  }
}

function sanitizeMatches(matches) {
  return matches.map(({ matchedText, ...rest }) => rest);
}

function isTsFile(filePath) {
  return /\.m?ts$/.test(filePath);
}

function hasTsNode() {
  try {
    execSync("npx ts-node --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasTsx() {
  try {
    execSync("npx tsx --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function resolveTsRunner() {
  if (hasTsx()) return "tsx";
  if (hasTsNode()) return "ts-node";
  return null;
}

// ----------------- RUN COMMAND -----------------
program
  .command("run <file>")
  .description("Run a Javascript/TypeScript file and analyze crashes")
  .option("--lang <code>", "output language (e.g. hi, es, fr)", "en")
  .action(async (file, options) => {
    const { default: ora } = await import("ora");
    const { default: chalk } = await import("chalk");

    const isJson = Boolean(program.opts().json);
    const themeName = program.opts().theme;
    const verbose = Boolean(program.opts().verbose);

    validateTheme(themeName);

    const filePath = path.resolve(process.cwd(), file);

    // Handle TypeScript files
    if (isTsFile(filePath)) {
      const runner = resolveTsRunner();
      if (!runner) {
        const theme = resolveTheme(themeName);
        const msg = chalk[theme.unknownText].bold(
          "\n❌ Cannot run TypeScript file: no runner found."
        );
        console.log(msg);
        console.log(
          chalk[theme.rawText](
            "Install a TypeScript runner:\n" +
              "  npm install -D tsx        (recommended, fast)\n" +
              "  npm install -D ts-node    (alternative)\n\n" +
              "Then retry: errlens run " + file
          )
        );
        process.exit(1);
      }
    }

    const spinner = isJson
      ? null
      : ora(`Running ${chalk.yellow(file)}...`).start();

    const isTs = isTsFile(filePath);
    const runner = isTs ? resolveTsRunner() : null;
    const execCmd = isTs ? "npx" : process.execPath;
    const execArgs = isTs ? ["--no-install", runner, filePath] : [filePath];

    const child = spawn(execCmd, execArgs, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: isTs && process.platform === "win32",
    });

    let errorOutput = "";

    child.stdout.on("data", (data) => {
      if (!isJson) {
        spinner.stop();
        process.stdout.write(data);
        spinner.start();
      }
    });

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
      if (!isJson) {
        process.stderr.write(data);
      }
    });

    child.on("close", (code, signal) => {
      if (!isJson && spinner) {
        spinner.stop();
      }

      const { count, matches } = findError(errorOutput, options.lang);

      if (code === null) {
        if (isJson) {
          console.log(
            JSON.stringify({ code: 1, count, matches: sanitizeMatches(matches) }, null, 2)
          );
        } else {
          const theme = resolveTheme(themeName);
          console.log(
            chalk[theme.signalText].bold(`\n⚠️ Process killed by signal: ${signal}`)
          );
        }

        process.exit(1);
      }

      if (isJson) {
        console.log(
          JSON.stringify({ code, count, matches: sanitizeMatches(matches) }, null, 2)
        );
        process.exit(code ?? 1);
      }

      const theme = resolveTheme(themeName);

      if (code === 0) {
        console.log(chalk[theme.successText].bold("\n✨ Process finished successfully."));
      } else {
        if (count > 0) {
          console.log(
            chalk[theme.headerText].bold(`\n🚀 ErrLens Analysis (${count} Issue(s)):`)
          );
          matches.forEach((m) =>
            console.log(
              formatError(m, { theme: themeName, verbose })
            )
          );
        } else {
          console.log(
            chalk[theme.unknownText].bold(
              "\n❌ Crash detected (No known fix in database):"
            )
          );
          console.log(chalk[theme.rawText](errorOutput));
        }
      }

      process.exit(code ?? 1);
    });

    child.on("error", (err) => {
      if (isJson) {
        console.log(
          JSON.stringify({ code: 1, count: 0, matches: [] }, null, 2)
        );
      } else {
        if (spinner) spinner.stop();
        const theme = resolveTheme(themeName);
        console.log(chalk[theme.errorText](`System Error: ${err.message}`));
      }

      process.exit(1);
    });
  });

// ----------------- ANALYZE COMMAND -----------------
program
  .command("analyze <errorString>")
  .description("Analyze a specific error string")
  .option("--lang <code>", "output language (e.g. hi, es, fr)", "en")
  .action(async (errorString, options) => {
    const { default: chalk } = await import("chalk");
    const isJson = Boolean(program.opts().json);
    const themeName = program.opts().theme;
    const verbose = Boolean(program.opts().verbose);

    validateTheme(themeName);

    const { count, matches } = findError(errorString, options.lang);
    const exitCode = count > 0 ? 1 : 0;

    if (isJson) {
      console.log(
        JSON.stringify({ code: exitCode, count, matches: sanitizeMatches(matches) }, null, 2)
      );
      process.exit(exitCode);
    }

    if (count > 0) {
      const theme = resolveTheme(themeName);
      console.log(
        chalk[theme.headerText].bold(`\n🚀 ErrLens Analysis (${count} Issue(s)):`)
      );
      matches.forEach((m) =>
        console.log(formatError(m, { theme: themeName, verbose }))
      );
    } else {
      const theme = resolveTheme(themeName);
      console.log(
        chalk[theme.unknownText].bold(
          "\n❌ Crash detected (No known fix in database):"
        )
      );
      console.log(chalk[theme.rawText](errorString));
    }

    process.exit(exitCode);
  });

// ----------------- PARSE -----------------
program.parseAsync(process.argv).catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
