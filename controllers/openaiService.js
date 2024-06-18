const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractFieldsWithOpenAI(base64Image, textArray) {
  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Extract the following fields from the text:
        
          - **Invoice Date:** (DD/MM/YY format)
          - **Invoice Number:**
          - **Total Amount:** (Include currency symbol if present)
          - **Classification:** (Strictly "Medical", "Dental", or "Non-Medical")
          
          Text:
          ${textArray.join('\n')}
          
          Respond with JSON:
          
          { "Invoice Date": "", "Invoice Number": "", "Total Amount": "", "Classification": "" }`
          },
          {
            type: "image_base64",
            image_base64: {
              "base64": base64Image,
            },
          },
        ],
      },
    ];

    console.log("Sending request to OpenAI with message:", JSON.stringify(messages, null, 2));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 500,
      temperature: 0,
    });

    let result = response.choices[0].message.content.trim();
    console.log("OpenAI response:", result);

    // Use regex to remove markdown markers
    result = result.replace(/```json\n?|```/g, '').trim();

    try {
      const parsedResult = JSON.parse(result);
      return parsedResult;
    } catch (e) {
      console.error("Failed to parse JSON:", result);
      throw new Error("OpenAI response was not valid JSON");
    }

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
