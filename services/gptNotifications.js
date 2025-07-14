import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCarNotification(car) {
  const prompt = `
You are a car maintenance assistant. Based on the following car information, generate a short notification to the user about their car's maintenance status. 
Focus on whether maintenance is overdue or upcoming based on mileage or last maintenance date.
Return just a sentence.

Car Info:
- Brand: ${car.brand}
- Model: ${car.model}
- Year: ${car.year}
- Mileage: ${car.mileage} km
- Last Maintenance: ${car.lastMaintenance?.toISOString().split('T')[0] || "Unknown"}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: "system", content: "You generate car maintenance alerts." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("GPT Notification Error:", error.message);
    return "Unable to generate notification. Please try again.";
  }
}
