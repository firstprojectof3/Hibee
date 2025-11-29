import type {
  UsageData,
  NotificationData,
  CheckInData,
  UserProfile,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface AiCommentRequest {
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

/**
 * 백엔드 AI 서버에 오늘 리포트 분석 요청
 */
export async function requestAiComment(
  payload: AiCommentRequest,
): Promise<AiCommentResponse> {
  const res = await fetch(`${API_BASE_URL}/api/ai/daily-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`AI 서버 응답 에러: ${res.status}`);
  }

  const data = (await res.json()) as AiCommentResponse;
  return data;
}
