#!/usr/bin/env node

const { Command } = require("commander");
const { spawn } = require("child_process");
const ora = require("ora").default; 
const chalk = require("chalk");
const path = require("path");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");

const program = new Command();

program
  .name("errlens")
  .description("Professional JS Error Analytics")
  .version("1.3.1");

// ----------------- RUN COMMAND -----------------
program
  .command("run <file>")
  .option('--json', 'Output JSON instead of pretty UI')
  .description("Run a Javascript file and analyze crashes")
  .action((file, options) => {
    const filePath = path.resolve(process.cwd(), file);
    const isJson = Boolean(options.json || process.argv.includes("--json"));
    const spinner = isJson ? null : ora(`Running ${chalk.yellow(file)}...`).start();

    const child = spawn(process.execPath, [filePath], { stdio: ["inherit", "pipe", "pipe"] });

    let errorOutput = "";

    // Stream logs to terminal in real-time
    child.stdout.on("data", (data) => {
      if (!isJson) {
        spinner.stop();
        process.stdout.write(data);
        spinner.start();
      }
    });

    // Capture stderr for analysis
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();

      if (!isJson) {
        process.stderr.write(data);
      }
    });

    child.on("close", (code, signal) => {
      if (!isJson) {
        spinner.stop();
      }

      const { count, matches } = findError(errorOutput);

      if (code === null) {
        if (isJson) {
          const result = { code: 1, count, matches };
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(chalk.red.bold(`\n⚠️ Process killed by signal: ${signal}`));
        }
        process.exit(1);
        return;
      }

      if (isJson) {
        const result = { code, count, matches };
        console.log(JSON.stringify(result, null, 2));
      } else if (code === 0) {
          console.log(chalk.green.bold("\n✨ Process finished successfully."));
      } else {
        if (count > 0) {
          console.log(chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`));
          matches.forEach(m => console.log(formatError(m))); // Pretty UI only here
        } else {
          console.log(chalk.red.bold("\n❌ Crash detected (No known fix in database):"));
          console.log(chalk.gray(errorOutput));
        }
      }

      process.exit(code ?? 1);
    });

    child.on("error", (err) => {
      if (isJson) {
        const result = { code: 1, count: 0, matches: [] };
        console.log(JSON.stringify(result, null, 2));
      } else {
        spinner.fail(chalk.red(`System Error: ${err.message}`));
      }
      process.exit(1);
    });
  });

// ----------------- ANALYZE COMMAND -----------------
program
  .arguments("<errorString>") // default command if no "run"
  .description("Analyze a specific error string")
  .option('--json', 'Output result in JSON format')
  .action((errorString, options) => {
    const { count, matches } = findError(errorString);
    const exitCode = count > 0 ? 1 : 0;
    const isJson = Boolean(options.json || process.argv.includes("--json"));

    if (isJson) {
      console.log(JSON.stringify({ code: 1, count, matches }, null, 2));
      process.exit(exitCode);
      return;
    }

    if (count > 0) {
      console.log(chalk.bold.cyan(`\n🚀 ErrLens Analysis (${count} Issue(s)):`));
      matches.forEach(m => console.log(formatError(m))); // Pretty UI
    } else {
      console.log(chalk.red.bold("\n❌ Crash detected (No known fix in database):"));
      console.log(chalk.gray(errorString));
    }
  });

// ----------------- PARSE ARGUMENTS -----------------
program.parse(process.argv);