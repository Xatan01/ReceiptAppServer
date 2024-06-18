const axios = require('axios');
require("dotenv").config();

async function extractFieldsWithClaude(s3Url) {
  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      {
        role: "user",
        content: `
          Extract the following fields from the image at the given URL:
          
          - **Invoice Date:** (DD/MM/YY format)
          - **Invoice Number:**
          - **Total Amount:** (Include currency symbol if present)
          - **Classification:** (Strictly "Medical", "Dental", or "Non-Medical")
          
          Image URL: ${s3Url}
          
          Respond with JSON:
          
          {
            "invoiceDate": "DD/MM/YY",
            "invoiceNumber": "...",
            "totalAmount": "...",
            "classification": "Medical" // or "Non-Medical"
          }
        `
      }
    ];

    console.log("Sending request to Claude with message:", JSON.stringify(messages, null, 2));

    const response = await axios.post('https://api.anthropic.com/v1/complete', {
      prompt: JSON.stringify(messages),
      model: "claude-3-sonnet-20240229",
      max_tokens_to_sample: 500,
      temperature: 0,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let result = response.data.completion.trim();
    console.log("Claude response:", result);

    // Use regex to remove markdown markers
    result = result.replace(/```json\n?|```/g, '').trim();

    try {
      const parsedResult = JSON.parse(result);
      return parsedResult;
    } catch (e) {
      console.error("Failed to parse JSON:", result);
      throw new Error("Claude response was not valid JSON");
    }

  } catch (error) {
    console.error("Error extracting fields:", error.message, error);
    if (error.response && error.response.status === 429) {
      throw new Error("Claude API rate limit exceeded. Try again later.");
    } else if (error.response && error.response.status === 401) {
      throw new Error("Invalid Claude API key. Check your configuration.");
    } else {
      throw new Error("Failed to extract fields from text. Check the input or try again.");
    }
  }
}

module.exports = { extractFieldsWithClaude };
