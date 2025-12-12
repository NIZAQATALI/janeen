import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message
    });

    return res.status(200).json({
      success: true,
      reply: response.text
    });

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get response from Gemini AI.",
      error: error.message
    });
  }
};
