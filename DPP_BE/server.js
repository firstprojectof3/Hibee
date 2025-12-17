const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

// FastAPI AI 서비스 주소 (나중에 .env로 분리 가능)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

app.use(cors());
app.use(express.json());

// Node 서버 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Node backend is running" });
});

// Node -> FastAPI 헬스 체크
app.get("/health/ai", async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`);
    res.json({
      node: "ok",
      ai_service: response.data,
    });
  } catch (error) {
    console.error("AI service health error:", error.message);
    res.status(500).json({
      node: "ok",
      ai_service: "unreachable",
    });
  }
});

// 안드로이드 앱에서 호출할 엔드포인트
// POST /api/ai/daily-report
app.post("/api/ai/daily-report", async (req, res) => {
  try {
    const body = req.body?.data ?? req.body; // 혹시 data로 감싸져 오면 풀어줌

    const payload = {
      totalScore: body?.totalScore,
      usage: body?.usage,
      notifications: body?.notifications,
      checkIn: body?.checkIn,
      profile: body?.profile,
    };

    console.log("↪ payload to AI:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${process.env.FASTAPI_URL || "http://localhost:8100"}/ai/daily-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log("↪ AI status:", response.status);
    console.log("↪ AI raw body:", text);

    if (!response.ok) {
      return res.status(response.status).json({ error: "AI error", detail: text });
    }

    return res.json(JSON.parse(text));
  } catch (err) {
    console.error("❌ Error calling AI service (FULL):", err);
    return res.status(500).json({
      error: "Failed to call AI service",
      detail: err?.message || String(err),
    });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Node backend listening on http://localhost:${PORT}`);
});
