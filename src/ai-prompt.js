const { OpenAI } = require("openai");

const analyzeContract = async (contract, apiKey) => {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const params = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `You are a smart contract security expert. Audit & Analyze the following contract and provide a detailed report on the code quality, security, and best practices here is the smart contract:${contract}

                Please provide the results in the following array format for easy frontend integration and display.

                [
                  {
                    "section": "Audit Report",
                    "data": {
                      "title": "Title of the issue",
                      "details": "A detailed audit report of the smart contract covering security, performance, and any other relevant aspects",
                      "severity": "Severity of the issue (e.g. low, medium, high)",
                      "line": "Line number where the issue is located",
                      "code": "Code snippet where the issue is located"
                    }
                  },
                  {
                    "section": "Metric scores",
                    "details": [
                      {
                        "metric": "Security",
                        "score": "0-10"
                      },
                      {
                        "metric": "Performance",
                        "score": "0-10"
                      },
                      {
                        "metric": "Other Key Areas",
                        "score": "0-10"
                      },
                      {
                        "metric": "Gas Optimization",
                        "score": "0-10"
                      },
                      {
                        "metric": "Code Quality",
                        "score": "0-10"
                      },
                      {
                        "metric": "Documentation",
                        "score": "0-10"
                      },
                    ]
                  },

                  [
                  "section": "Suggestions for Improvement",
                  "details": " Suggestions on how to improve the code quality, security, and best practices of the smart contract and any other identified weaknesses"
                  ]
                  Thank you!
                ]`
      }
    ],
  };

  // TODO: Add code to send the request to OpenAI and process the response
  // const response = await openai.chat.completions.create(params);
  // return response.choices[0].message.content;

  const chatCompletion = await openai.chat.completions.create(params);

  const auditResults = JSON.parse(chatCompletion.choices[0].message.content);
};

module.exports = { analyzeContract };
