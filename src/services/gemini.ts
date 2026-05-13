import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function sendMessage(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = []) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are NEXA, a helpful and friendly all-in-one AI assistant. You help users with budgeting, travel planning, education, and work. Keep responses concise, organized, and use Markdown. For travel plans, provide structured data like 'Budget Estimate', 'Transport', 'Stay', 'Food', 'Top Places', and 'Weather'.",
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please check your API key in the settings.";
  }
}
