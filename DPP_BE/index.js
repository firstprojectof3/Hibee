require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ----- 설정값 -----
const PORT = process.env.PORT || 4000;
const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8100";

// ----- 공통 미들웨어 -----
app.use(cors()); // 나중에 origin 제한 필요하면 옵션 추가
app.use(express.json()); // JSON body 파싱

// ----- 헬스체크 -----
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "DPP_BE", ai_server: FASTAPI_URL });
});

// ----- AI 프록시 엔드포인트 -----
// FE에서 호출하는 주소: POST /api/ai/daily-report
app.post("/api/ai/daily-report", async (req, res) => {
  try {
    const payload = {
      totalScore: req.body.totalScore,
      usage: req.body.usage,
      notifications: req.body.notifications,
      checkIn: req.body.checkIn,
      profile: req.body.profile,
    };

    // 디버깅용: payload가 비었는지 즉시 확인
    console.log("↪ payload to AI:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${FASTAPI_URL}/ai/daily-report`, {
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
    console.error("❌ Error calling AI service:", err);
    return res.status(500).json({ error: "Failed to call AI service", detail: err.message });
  }
});


// JSON 파싱 안전용 helper
async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// ----- 서버 시작 -----
app.listen(PORT, () => {
  console.log(`✅ DPP_BE server running on http://localhost:${PORT}`);
  console.log(`↪ AI server proxy target: ${FASTAPI_URL}/ai/daily-report`);
});
