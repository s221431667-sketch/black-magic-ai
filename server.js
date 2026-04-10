const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const CHATBOX_API_KEY = "chat_sk_amabhozza_7f92c1d8e4b6x901";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chat API is running (Hugging Face connected)",
    apiKeyHeader: "x-api-key",
    endpoint: "/api/chat"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const message = req.body?.message?.trim();

    if (!apiKey) {
      return res.status(401).json({ success: false, error: "Missing API key" });
    }

    if (apiKey !== CHATBOX_API_KEY) {
      return res.status(403).json({ success: false, error: "Invalid API key" });
    }

    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b:fastest",
      messages: [
        {
          role: "system",
          content: "You are Black Magic AI, intelligent, helpful, and knowledgeable."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 300
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No response received.";

    return res.json({
      success: true,
      reply
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "AI request failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
