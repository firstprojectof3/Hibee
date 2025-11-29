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
    // FE → Node로 들어온 body 그대로 FastAPI로 전달
    const body = req.body;

    // 간단한 검증 (있어도 되고, 나중에 더 추가 가능)
    if (!body || typeof body.totalScore === "undefined") {
      return res.status(400).json({
        message: "잘못된 요청입니다. totalScore가 필요해요.",
      });
    }

    const response = await fetch(`${FASTAPI_URL}/ai/daily-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // FastAPI 쪽에서 에러가 난 경우
    if (!response.ok) {
      const errorData = await safeJson(response);

      console.error("❌ FastAPI /ai/daily-report error", {
        status: response.status,
        data: errorData,
      });

      return res.status(502).json({
        message: "AI 서버에서 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
        error_type: "ai_backend_error",
        upstream_status: response.status,
      });
    }

    // 정상 응답 (comment, suggestion)
    const data = await response.json();

    // 그대로 FE에 전달
    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Node /api/ai/daily-report internal error:", err);
    return res.status(500).json({
      message: "서버 내부에서 오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
      error_type: "node_internal_error",
    });
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
