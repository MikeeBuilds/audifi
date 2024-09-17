#!/usr/bin/env node

const { Command } = require("commander");
const inquirer = require("inquirer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

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
        console.error(`File not found: ${contractPath}`);
        process.exit(1);
      }

      if (fs.statSync(contractPath).isDirectory()) {
        console.error(`Path is a directory, not a file: ${contractPath}`);
        process.exit(1);
      }

      const contract = fs.readFileSync(contractPath, "utf8");
      await analyzeContract(contract, apiKey);
    } catch (error) {
      console.error("Error during analysis:", error.message);
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

  const prompt = `Please analyze the following smart contract for potential security vulnerabilities and best practices:

${contract}

Provide a detailed report on:
1. Potential security vulnerabilities
2. Code quality and best practices
3. Gas optimization suggestions
4. Overall assessment and recommendations`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log(response.text());
  } catch (error) {
    console.error("Error during analysis:", error.message);
  }
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
        console.error(`File not found: ${contractPath}`);
        process.exit(1);
      }

      if (fs.statSync(contractPath).isDirectory()) {
        console.error(`Path is a directory, not a file: ${contractPath}`);
        process.exit(1);
      }

      const contract = fs.readFileSync(contractPath, "utf8");
      await analyzeContract(contract, apiKey);
    } catch (error) {
      console.error("Error during analysis:", error.message);
    }
  });

program.parse(process.argv);