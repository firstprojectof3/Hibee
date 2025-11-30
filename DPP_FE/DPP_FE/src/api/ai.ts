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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data as ApiErrorResponse | null;
    const message =
      err?.message ?? "AI 리포트를 가져오는 중 오류가 발생했어요.";
    throw new Error(message);
  }

  return data as AiCommentResponse;
}


export async function requestAiComment(
  payload: AiCommentRequest
): Promise<AiCommentResponse> {
  // 내부적으로는 fetchDailyReport 재사용
  return fetchDailyReport(payload);
}
