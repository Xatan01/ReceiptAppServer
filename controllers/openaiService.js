// openaiService.js

const OpenAI = require("openai");
require("dotenv").config();

async function extractFieldsWithOpenAI(textArray) {
  try {
    // Initialize the OpenAI API client with the API key from the environment variable
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI API key
    });

    // Prepare the messages for the chat completion request
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      {
        role: "user",
        content: `
          Extract the following fields from the text:
          
          - **Invoice Date:** (DD/MM/YY format)
          - **Invoice Number:**
          - **Total Amount:** (Include currency symbol if present)
          - **Classification:** (Strictly "Medical" or "Non-Medical")
          
          Text:
          ${textArray.join('\n')}
          
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

    // Make the chat completion request
    const response = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo", // Use the correct model name
      max_tokens: 500,
      temperature: 0, // 0 for deterministic output
    });

    // Extract and parse the result from the response
    const result = response.choices[0].message.content.trim();

    // Validate JSON before parsing (optional but recommended)
    try {
      JSON.parse(result);
    } catch (e) {
      throw new Error("OpenAI response was not valid JSON");
    }

    return JSON.parse(result);

  } catch (error) {
    console.error("Error extracting fields:", error.message, error);
    if (error.response && error.response.status === 429) {
      throw new Error("OpenAI API rate limit exceeded. Try again later.");
    } else if (error.response && error.response.status === 401) {
      throw new Error("Invalid OpenAI API key. Check your configuration.");
    } else {
      throw new Error("Failed to extract fields from text. Check the input or try again.");
    }
  }
}

module.exports = { extractFieldsWithOpenAI };
