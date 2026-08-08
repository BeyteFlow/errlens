#!/usr/bin/env node

"use strict";

const { Command } = require("commander");
const { spawn } = require("child_process");
const path = require("path");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");
const { THEME_NAMES, isValidTheme } = require("../lib/themes");
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

// ----------------- HELPER: validate theme -----------------
function validateTheme(name) {
  if (name && !isValidTheme(name)) {
    console.error(
      `Unknown theme "${name}". Available: ${THEME_NAMES.join(", ")}`
    );
    process.exit(1);
  }
}

// ----------------- RUN COMMAND -----------------
program
  .command("run <file>")
  .description("Run a Javascript file and analyze crashes")
  .option("--lang <code>", "output language (e.g. hi, es, fr)", "en")
  .action(async (file, options) => {
    const { default: ora } = await import("ora");
    const { default: chalk } = await import("chalk");

    const isJson = Boolean(program.opts().json);
    const themeName = program.opts().theme;
    const verbose = Boolean(program.opts().verbose);

    validateTheme(themeName);

    const filePath = path.resolve(process.cwd(), file);
    const spinner = isJson
      ? null
      : ora(`Running ${chalk.yellow(file)}...`).start();

    const child = spawn(process.execPath, [filePath], {
      stdio: ["inherit", "pipe", "pipe"],
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
        const result = { code: 1, count, matches };

        if (isJson) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(
            chalk.red.bold(`\n⚠️ Process killed by signal: ${signal}`)
          );
        }

        process.exit(1);
      }

      if (isJson) {
        console.log(JSON.stringify({ code, count, matches }, null, 2));
        process.exit(code ?? 1);
      }

      if (code === 0) {
        console.log(chalk.green.bold("\n✨ Process finished successfully."));
      } else {
        if (count > 0) {
          console.log(
            chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`)
          );
          matches.forEach((m) =>
            console.log(
              formatError(m, { theme: themeName, verbose })
            )
          );
        } else {
          console.log(
            chalk.red.bold(
              "\n❌ Crash detected (No known fix in database):"
            )
          );
          console.log(chalk.gray(errorOutput));
        }
      }

      process.exit(code ?? 1);
    });

    child.on("error", (err) => {
      const result = { code: 1, count: 0, matches: [] };

      if (isJson) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (spinner) spinner.stop();
        console.log(chalk.red(`System Error: ${err.message}`));
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
        JSON.stringify({ code: exitCode, count, matches }, null, 2)
      );
      process.exit(exitCode);
    }

    if (count > 0) {
      console.log(
        chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`)
      );
      matches.forEach((m) =>
        console.log(formatError(m, { theme: themeName, verbose }))
      );
    } else {
      console.log(
        chalk.red.bold(
          "\n❌ Crash detected (No known fix in database):"
        )
      );
      console.log(chalk.gray(errorString));
    }

    process.exit(exitCode);
  });

// ----------------- PARSE -----------------
program.parse(process.argv);
