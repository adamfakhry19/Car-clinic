import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getDiagnosis(symptoms, carInfo = {}) {
  try {
    const prompt = `
You are a car diagnostic assistant. Based on the following user input and car details, return ONLY a valid JSON object in this format:

{
  "issue": "Short title of likely problem",
  "severity": "Low / Moderate / Critical",
  "confidence": "e.g. 85%",
  "solution": "Clear and concise fix"
}

User car:
- Brand: ${carInfo.brand || "Unknown"}
- Model: ${carInfo.model || "Unknown"}
- Year: ${carInfo.year || "Unknown"}
- Mileage: ${carInfo.mileage || "Unknown"}
- Last Maintenance: ${carInfo.lastMaintenance || "Unknown"}

Symptoms:
"${symptoms}"

Return only the JSON. Do not include explanation.
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You diagnose car problems based on symptoms and car information." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,

    });

    const message = response.choices[0].message.content.trim();

    console.log("🔍 ChatGPT Raw Response:\n", message);
    try {
      const parsed = JSON.parse(message);
      if (
        parsed.issue &&
        parsed.severity &&
        parsed.confidence &&
        parsed.solution
      ) {
        return parsed;
      } else {
        throw new Error("Missing keys in parsed JSON");
      }
    } catch (innerErr) {
      const jsonMatch = message.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Invalid JSON format from GPT");
    }

  } catch (error) {
    console.error("GPT Error:", error.message);
    return {
      issue: "Unknown",
      severity: "Unknown",
      confidence: "Low",
      solution: "Unable to determine the issue. Please try again later."
    };
  }
}
