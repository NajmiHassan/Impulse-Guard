import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 From environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" +
  GEMINI_API_KEY;

// API endpoint your extension will call
app.post("/analyze", async (req, res) => {
  const { productName, price, userReason } = req.body;

  const prompt = `You are a financial advisor.
User wants to buy: ${productName}
Price: ${price}
Reason: ${userReason}
Give one short sentence of advice.`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    });

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No advice returned.";

    res.json({ success: true, advice: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, advice: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend running on http://localhost:3000");
});

export default app;