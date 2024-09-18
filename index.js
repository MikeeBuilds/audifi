#!/usr/bin/env node

const { Command } = require("commander");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { analyzeContract } = require("./src/ai-prompt");

const program = new Command();

program
  .name("audifi")
  .description("A CLI tool to audit smart contracts using Google's Gemini AI")
  .version("1.0.0");

program
  .command("check <file>")
  .description("Analyze a smart contract")
  .action(async (file) => {
    try {
      const { apiKey } = await inquirer.prompt([
        {
          type: "input",
          name: "apiKey",
          message: "Enter your Gemini API key:",
          validate: (input) => input.length > 0 || "API key is required",
        },
      ]);

      const contractPath = path.resolve(process.cwd(), file);
      console.log(`Checking file at path: ${contractPath}`);

      if (!fs.existsSync(contractPath)) {
        console.error(chalk.red(`File not found: ${contractPath}`));
        process.exit(1);
      }

      if (fs.statSync(contractPath).isDirectory()) {
        console.error(chalk.red(`Path is a directory, not a file: ${contractPath}`));
        process.exit(1);
      }

      const contract = fs.readFileSync(contractPath, "utf8");
      await analyzeContract(contract, apiKey);

    } catch (error) {
      console.error(chalk.red("Error during analysis:"), error.message);
    }
  });

program.parse(process.argv);
