// src/pages/DailyReportTest.tsx
import { useState } from "react";
import {
  fetchDailyReport,
  AiCommentRequest,
  AiCommentResponse,
} from "../api/ai";

const dummyPayload: AiCommentRequest = {
  totalScore: 35,
  usage: {
    totalTime: 300,
    lateNightTime: 80,
    longSessions: 3,
    shortFormRatio: 0.4,
    snsRatio: 0.3,
    gameRatio: 0.2,
  },
  notifications: {
    importantCount: 15,
    lowPriorityCount: 40,
    hasOverload: true,
  },
  checkIn: {
    mood: 3,
    satisfaction: 2,
    goalAchieved: false,
    memo: "오늘 유튜브를 너무 많이 봤다.",
  },
  profile: {
    level: 2,
    experience: 120,
    experienceToNextLevel: 80,
    totalDays: 10,
    currentStreak: 3,
    onboarding: {
      targetScreenTime: 240,
      targetBedTime: "23:30",
    },
  },
};

export function DailyReportTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiCommentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchDailyReport(dummyPayload);
      setResult(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("알 수 없는 오류가 발생했어요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1>📱 DPP AI Daily Report 테스트</h1>
      <p>버튼을 누르면 Node → FastAPI → OpenAI까지 한 번에 호출해봐요.</p>

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 16,
          marginTop: 12,
        }}
      >
        {loading ? "요청 중..." : "AI 리포트 가져오기"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#ffe6e6",
          }}
        >
          <strong>에러:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#f5f5ff",
            lineHeight: 1.5,
          }}
        >
          <h2>오늘 리포트 📝</h2>
          <p>{result.comment}</p>

          <h2 style={{ marginTop: 16 }}>내일 액션 카드 💡</h2>
          <p>{result.suggestion}</p>
        </div>
      )}
    </div>
  );
}
