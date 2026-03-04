#!/usr/bin/env node

const { Command } = require("commander");
const { spawn } = require("child_process");
const chalk = require("chalk");
const path = require("path");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");
const { version } = require("../package.json");

const program = new Command();

program
  .name("errlens")
  .description("Professional JS Error Analytics")
  .version(version)
  .option("--json", "Output JSON instead of pretty UI"); // ✅ GLOBAL OPTION

// ----------------- RUN COMMAND -----------------
program
  .command("run <file>")
  .description("Run a Javascript file and analyze crashes")
  .action(async (file) => {
    const { default: ora } = await import("ora");

    const isJson = Boolean(program.opts().json);
    const filePath = path.resolve(process.cwd(), file);
    const spinner = isJson
      ? null
      : ora(`Running ${chalk.yellow(file)}...`).start();

    const child = spawn(process.execPath, [filePath], {
      stdio: ["inherit", "pipe", "pipe"],
    });

    let errorOutput = "";

    // Stream stdout only in pretty mode
    child.stdout.on("data", (data) => {
      if (!isJson) {
        spinner.stop();
        process.stdout.write(data);
        spinner.start();
      }
    });

    // Capture stderr (DO NOT print in JSON mode)
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

      const { count, matches } = findError(errorOutput);

      // Process killed by signal
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

      // JSON MODE
      if (isJson) {
        console.log(JSON.stringify({ code, count, matches }, null, 2));
        process.exit(code ?? 1);
      }

      // PRETTY MODE
      if (code === 0) {
        console.log(chalk.green.bold("\n✨ Process finished successfully."));
      } else {
        if (count > 0) {
          console.log(
            chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`)
          );
          matches.forEach((m) => console.log(formatError(m)));
        } else {
          console.log(
            chalk.red.bold("\n❌ Crash detected (No known fix in database):")
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
  .action((errorString) => {
    const isJson = Boolean(program.opts().json);
    const { count, matches } = findError(errorString);
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
      matches.forEach((m) => console.log(formatError(m)));
    } else {
      console.log(
        chalk.red.bold("\n❌ Crash detected (No known fix in database):")
      );
      console.log(chalk.gray(errorString));
    }

    process.exit(exitCode);
  });

// ----------------- PARSE -----------------
program.parse(process.argv);