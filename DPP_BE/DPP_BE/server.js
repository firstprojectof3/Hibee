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
  const payload = req.body;

  // 최소 필드 검증 (v0.1)
  if (!payload || !payload.user_id || !payload.date) {
    return res.status(400).json({
      error: "Invalid request: 'user_id' and 'date' are required.",
    });
  }

  try {
    // Node -> FastAPI로 그대로 포워딩
    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/ai/daily-report`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // FastAPI에서 온 response.json을 그대로 앱에 반환
    return res.json(aiResponse.data);
  } catch (error) {
    console.error("Error calling AI service:", error.message);

    if (error.response) {
      return res.status(500).json({
        error: "AI service error",
        status: error.response.status,
        detail: error.response.data,
      });
    }

    return res.status(500).json({
      error: "Failed to call AI service",
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Node backend listening on http://localhost:${PORT}`);
});
