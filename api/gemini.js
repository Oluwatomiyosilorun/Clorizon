import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, systemPrompt } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
    });

    return res.status(200).json({
      text: result.response.text(),
    });

  } catch (err) {
    console.error("Vercel Gemini API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
