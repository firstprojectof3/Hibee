const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  console.error(
    "⚠️ VITE_API_BASE_URL이 설정되지 않았어요. .env 파일을 확인해 주세요."
  );
}

// ==== 타입 정의 ====

export interface UsageData {
  totalTime: number;
  lateNightTime: number;
  longSessions: number;
  shortFormRatio: number;
  snsRatio: number;
  gameRatio: number;
}

export interface NotificationData {
  importantCount: number;
  lowPriorityCount: number;
  hasOverload: boolean;
}

export interface CheckInData {
  mood: number;
  satisfaction: number;
  goalAchieved: boolean;
  memo?: string;
}

export interface OnboardingData {
  targetScreenTime: number;
  targetBedTime: string;
}

export interface UserProfile {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalDays: number;
  currentStreak: number;
  onboarding: OnboardingData;
}

export interface AiCommentRequest {
  
  user_id: string;
  date: string;
  
  totalScore: number;
  usage: UsageData;
  notifications: NotificationData;
  checkIn: CheckInData;
  profile: UserProfile;
}

export interface AiCommentResponse {
  comment: string;
  suggestion: string;
}

export interface ApiErrorResponse {
  message: string;
  error_type?: string;
  upstream_status?: number;
}

// ==== 실제 호출 함수 ====

export async function fetchDailyReport(
  payload: AiCommentRequest
): Promise<AiCommentResponse> {
  const url = `${API_BASE_URL}/api/ai/daily-report`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // ✅ 먼저 text로 받아두면, 서버가 JSON이 아닌 에러를 줘도 내용을 볼 수 있어
  const rawText = await res.text();

  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    console.error("[AI API ERROR]", {
      url,
      status: res.status,
      statusText: res.statusText,
      body: data ?? rawText,
    });

    // 서버가 {message} 또는 {detail} 또는 {error, detail} 등 여러 형태로 줄 수 있어서 방어
    const message =
      data?.message ??
      data?.detail ??
      data?.error ??
      `AI 리포트 요청 실패 (${res.status})`;

    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }

  if (!data) {
    console.warn("[AI API WARN] Response is not JSON:", rawText);
    throw new Error("AI 리포트 응답 형식이 올바르지 않아요.");
  }

  return data as AiCommentResponse;
}



export async function requestAiComment(
  payload: AiCommentRequest
): Promise<AiCommentResponse> {
  // 내부적으로는 fetchDailyReport 재사용
  return fetchDailyReport(payload);
}
