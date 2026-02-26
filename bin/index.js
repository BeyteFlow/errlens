#!/usr/bin/env node

const { Command } = require("commander");
const ora = require("ora");
const chalk = require("chalk");
const { findError } = require("../lib/matcher");
const { formatError } = require("../lib/formatter");

const program = new Command();

program
  .name("errlens")
  .description("Professional JS error analysis for the terminal")
  .version("1.1.0")
  .argument("[error]", "The error message to analyze")
  .option("-j, --json", "Output results in raw JSON format") // For automation
  .action((errorInput, options) => {
    // If no argument is provided, show help and exit
    if (!errorInput) {
      program.help();
      return;
    }

    // JSON Mode (No spinner, no colors, just data)
    if (options.json) {
      const result = findError(errorInput);
      console.log(JSON.stringify(result || { error: "No match found" }, null, 2));
      return;
    }

    // Standard Mode
    const spinner = ora({ text: "Analyzing error trace...", color: "cyan" }).start();

    setTimeout(() => {
      const result = findError(errorInput);

      if (!result) {
        spinner.fail(chalk.red(" Analysis Failed: Error not found in database."));
        console.log(chalk.dim("\nTry searching a shorter snippet of the error message."));
        return;
      }

      spinner.succeed(chalk.bold("Analysis complete!"));
      console.log(formatError(result));
    }, 500);
  });

program.parse(process.argv);