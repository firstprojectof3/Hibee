// 타입 재수출 (App.tsx에서 그대로 import해서 쓸 수 있게)
export type { AiCommentRequest, AiCommentResponse } from "../api/ai";

// 함수 재수출
export { fetchDailyReport, requestAiComment } from "../api/ai";