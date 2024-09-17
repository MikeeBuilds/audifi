const fs = require('fs');
const chalk = require('chalk');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const analyzeContract = async (contract, apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Enhanced Prompt with gas usage and security checks
  const prompt = `
  Your role is to perform a detailed audit on the following smart contract. 
  1. Analyze for security vulnerabilities, including reentrancy, overflows/underflows, uninitialized variables, and access control weaknesses.
  2. Provide a gas efficiency report, including function-wise gas consumption and suggestions for improvement.
  3. Offer code suggestions to fix vulnerabilities and optimize performance, where applicable.
  4. Assign a risk level (low, medium, high) for each vulnerability.
  5. Provide a weighted overall score based on custom metrics, and a summary in array format for front-end display:
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
      "details": "Suggestions for improving the smart contract in terms of security, performance, and any other identified weaknesses, with code examples if applicable."
    },
    {
      "section": "Risk Levels",
      "details": [
        {
          "vulnerability": "Reentrancy",
          "risk": "High"
        },
        {
          "vulnerability": "Gas Usage",
          "risk": "Medium"
        }
      ]
    }
  ]
  Thank you.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const auditResults = JSON.parse(response.text());

    // Display the audit report in the console with colors and enhanced UI
    console.log(chalk.blue.bold("=== Audit Report ==="));
    console.log(chalk.white(auditResults.find((r) => r.section === "Audit Report").details));

    console.log(chalk.blue.bold("\n=== Metric Scores ==="));
    auditResults
      .find((r) => r.section === "Metric Scores")
      .details.forEach((metric) => {
        const color = metric.score > 7 ? chalk.green : chalk.red;
        console.log(`${metric.metric}: ${color(metric.score)}/10`);
      });

    console.log(chalk.blue.bold("\n=== Suggestions for Improvement ==="));
    console.log(chalk.white(
      auditResults.find((r) => r.section === "Suggestions for Improvement").details
    ));

    console.log(chalk.blue.bold("\n=== Risk Levels ==="));
    auditResults.find((r) => r.section === "Risk Levels").details.forEach((risk) => {
      const riskColor = risk.risk === "High" ? chalk.red : chalk.yellow;
      console.log(`${risk.vulnerability}: ${riskColor(risk.risk)}`);
    });

    // Call function to export results as a PDF
    exportToPDF(auditResults);
  } catch (error) {
    console.error(chalk.red("Error during analysis:"), error.message);
  }
};

// Function to export audit results to a PDF
const exportToPDF = (auditResults) => {
  const doc = new PDFDocument();
  const outputFile = 'smart_contract_audit.pdf';
  const writeStream = fs.createWriteStream(outputFile);
  doc.pipe(writeStream);

  doc.fontSize(20).text('Smart Contract Audit Report', { align: 'center' });
  doc.moveDown();

  // Audit Report
  const auditReport = auditResults.find((r) => r.section === 'Audit Report').details;
  doc.fontSize(14).text('Audit Report:', { underline: true });
  doc.fontSize(12).text(auditReport);
  doc.moveDown();

  // Metric Scores
  doc.fontSize(14).text('Metric Scores:', { underline: true });
  const metrics = auditResults.find((r) => r.section === 'Metric Scores').details;
  metrics.forEach((metric) => {
    doc.fontSize(12).text(`${metric.metric}: ${metric.score}/10`);
  });
  doc.moveDown();

  // Suggestions for Improvement
  const suggestions = auditResults.find((r) => r.section === 'Suggestions for Improvement').details;
  doc.fontSize(14).text('Suggestions for Improvement:', { underline: true });
  doc.fontSize(12).text(suggestions);
  doc.moveDown();

  // Risk Levels
  doc.fontSize(14).text('Risk Levels:', { underline: true });
  const risks = auditResults.find((r) => r.section === 'Risk Levels').details;
  risks.forEach((risk) => {
    doc.fontSize(12).text(`${risk.vulnerability}: ${risk.risk}`);
  });
  
  doc.end();
  
  writeStream.on('finish', () => {
    console.log(chalk.green(`PDF report saved as ${outputFile}`));
  });
};

module.exports = { analyzeContract };
