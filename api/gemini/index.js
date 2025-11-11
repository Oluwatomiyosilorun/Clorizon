import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = process.env.GEMINI_API_KEY || "";
  if (!API_KEY) {
    console.error("Missing GEMINI_API_KEY in server environment");
    return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
  }

  try {
    const { message = "", systemPrompt = "" } = req.body;

    const client = new GoogleGenerativeAI({ apiKey: API_KEY });

    // Try to pick a model that supports generate / generateContent
    let modelName = "models/gemini-1.5-pro"; // fallback guess
    try {
      const list = await client.listModels?.();
      if (Array.isArray(list?.models) && list.models.length) {
        const pick = list.models.find(m => /gemini/i.test(m.name) && (m.supportedMethods?.includes("generate") || m.supportedMethods?.includes("generateContent")));
        modelName = pick ? pick.name : list.models[0].name;
      }
      console.log("Using model:", modelName);
    } catch (e) {
      console.warn("Could not list models, falling back to default modelName:", e?.message || e);
    }

    const model = client.getGenerativeModel({ model: modelName });

    let result;
    if (typeof model.generate === "function") {
      result = await model.generate({
        prompt: { text: `${systemPrompt}\n\nUser: ${message}` },
        maxOutputTokens: 512,
      });
    } else if (typeof model.generateContent === "function") {
      result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: message }] }],
        systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
      });
    } else {
      throw new Error("Selected model does not support generate or generateContent");
    }

    console.log("Raw model result:", JSON.stringify(result, null, 2));

    // Robust extraction
    let text = "";
    if (result?.response && typeof result.response.text === "function") {
      try { text = result.response.text(); } catch {}
    }
    if (!text && result?.candidates?.[0]?.content?.[0]?.text) {
      text = result.candidates[0].content[0].text;
    }
    if (!text && Array.isArray(result?.output)) {
      text = result.output.flatMap(o => (o.content || []).map(c => c.text || "")).join("\n");
    }
    if (!text && result?.choices?.[0]?.message?.content) {
      text = result.choices[0].message.content;
    }
    if (!text) text = JSON.stringify(result).slice(0, 2000);

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Vercel Gemini API Error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
