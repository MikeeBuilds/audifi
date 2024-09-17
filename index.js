#!/usr/bin/env node

const { Command } = require("commander");
const inquirer = require("inquirer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk"); // For color-coded output
const { exportToPDF } = require("./pdfExport"); // PDF export helper

const program = new Command();

program
  .name("audifi")
  .description("A CLI tool to audit smart contracts using Google's Gemini AI")
  .action(async (file) => {
    try {
      const apiKey = await getApiKey();
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
      const auditResult = await analyzeContract(contract, apiKey);

      // Color-coded report display
      displayAuditResult(auditResult);

      // Ask if the user wants to export the result as PDF
      const { exportToPdf } = await inquirer.prompt([
        {
          type: "confirm",
          name: "exportToPdf",
          message: "Would you like to export the audit report as a PDF?",
          default: true,
        },
      ]);

      if (exportToPdf) {
        const pdfPath = await exportToPDF(auditResult, contractPath);
        console.log(chalk.green(`Audit report saved as PDF at: ${pdfPath}`));
      }

    } catch (error) {
      console.error(chalk.red("Error during analysis:"), error.message);
    }
  });

const getApiKey = async () => {
  const { apiKey } = await inquirer.prompt([
    {
      type: "input",
      name: "apiKey",
      message: "Enter your Gemini API key:",
      validate: (input) => input.length > 0 || "API key is required",
    },
  ]);
  return apiKey;
};

const analyzeContract = async (contract, apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Your role and goal is to be an AI Smart Contract Auditor. Your job is to perform an audit on the given smart contract. Here is the smart contract: ${contract}.
  Please provide the results in the following array format for easy front-end display:
  [
    {
      "section": "Audit Report",
      "details": "A detailed audit report of the smart contract, covering security, performance, and any other relevant aspects."
    },
    {
      "section": "Metric Scores",
      "details": [
        {
          "metric": "Security",
          "score": 0-10
        },
        {
          "metric": "Performance",
          "score": 0-10
        },
        {
          "metric": "Other Key Areas",
          "score": 0-10
        },
        {
          "metric": "Gas Efficiency",
          "score": 0-10
        },
        {
          "metric": "Code Quality",
          "score": 0-10
        },
        {
          "metric": "Documentation",
          "score": 0-10
        }
      ]
    },
    {
      "section": "Suggestions for Improvement",
      "details": "Suggestions for improving the smart contract in terms of security, performance, and any other identified weaknesses."
    }
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text()); // Ensure we return the JSON result for display and export
  } catch (error) {
    console.error(chalk.red("Error during analysis:"), error.message);
  }
};

const displayAuditResult = (auditResult) => {
  // Display the audit report with colors for different sections
  const auditReport = auditResult.find((r) => r.section === "Audit Report").details;
  const metrics = auditResult.find((r) => r.section === "Metric Scores").details;
  const suggestions = auditResult.find((r) => r.section === "Suggestions for Improvement").details;

  console.log(chalk.blue.bold("\n=== Audit Report ===\n"));
  console.log(chalk.cyan(auditReport));

  console.log(chalk.blue.bold("\n=== Metric Scores ===\n"));
  metrics.forEach((metric) => {
    const color = metric.score >= 8 ? chalk.green : metric.score >= 5 ? chalk.yellow : chalk.red;
    console.log(`${metric.metric}: ${color(`${metric.score}/10`)}`);
  });

  console.log(chalk.blue.bold("\n=== Suggestions for Improvement ===\n"));
  console.log(chalk.cyan(suggestions));
};

program
  .command("check <file>")
  .description("Analyze a smart contract")
  .action(async (file) => {
    try {
      const apiKey = await getApiKey();

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
      const auditResult = await analyzeContract(contract, apiKey);

      // Color-coded report display
      displayAuditResult(auditResult);

      // Ask if the user wants to export the result as PDF
      const { exportToPdf } = await inquirer.prompt([
        {
          type: "confirm",
          name: "exportToPdf",
          message: "Would you like to export the audit report as a PDF?",
          default: true,
        },
      ]);

      if (exportToPdf) {
        const pdfPath = await exportToPDF(auditResult, contractPath);
        console.log(chalk.green(`Audit report saved as PDF at: ${pdfPath}`));
      }

    } catch (error) {
      console.error(chalk.red("Error during analysis:"), error.message);
    }
  });

program.parse(process.argv);
