const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const APP_API_KEY = process.env.APP_API_KEY;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Black Magic AI backend is running"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const key = req.headers["x-api-key"];
    const message = req.body?.message?.trim();

    if (!key) {
      return res.status(401).json({ success: false, error: "API key missing" });
    }

    if (key !== APP_API_KEY) {
      return res.status(403).json({ success: false, error: "Invalid API key" });
    }

    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: "You are Black Magic AI. Reply clearly and helpfully." },
          { role: "user", content: message }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: data?.error || "Hugging Face request failed"
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response generated.";

    return res.json({
      success: true,
      reply
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});