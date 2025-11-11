import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Prefer a server env var. Keep some common fallback names in case .env uses a different var.
const API_KEY = process.env.GEMINI_API_KEY
  || process.env.VITE_GEMINI_API_KEY
  || process.env.VITE_GOOGLE_API_KEY
  || process.env.GOOGLE_API_KEY
  || '';

if (!API_KEY) {
  console.error("GEMINI_API_KEY is missing in environment. Set GEMINI_API_KEY (or VITE_GEMINI_API_KEY / VITE_GOOGLE_API_KEY / GOOGLE_API_KEY) in your .env or env.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/api/gemini", async (req, res) => {
  try {
    const { message, systemPrompt } = req.body;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: message }] }
      ],
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      }
    });

    // Log raw response for debugging (remove in production)
    console.log("Raw Gemini result:", JSON.stringify(result, null, 2));

    // Robust text extraction (handle multiple SDK shapes)
    let text = "";
    if (result?.response && typeof result.response.text === "function") {
      text = result.response.text();
    } else if (result?.candidates?.[0]?.content?.[0]?.text) {
      text = result.candidates[0].content[0].text;
    } else if (Array.isArray(result?.output)) {
      text = result.output
        .flatMap(o => (o.content || []).map(c => c.text || ""))
        .join("\n");
    } else {
      text = JSON.stringify(result).slice(0, 2000); // fallback: return something useful for debugging
    }

    res.json({ text });

  } catch (error) {
    console.error("Gemini backend error:", error);
    res.status(500).json({ error: error.message || String(error) });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Gemini backend running on http://localhost:${PORT}`);
});
