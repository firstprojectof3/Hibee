export interface OnboardingData {
  targetScreenTime: number; // 분 단위
  targetBedTime: string; // HH:MM
  patterns: string[]; // 줄이고 싶은 패턴
}

export interface UsageData {
  totalTime: number; // 분 단위
  lateNightTime: number; // 취침 시간 이후 사용
  longSessions: number; // 20분 이상 세션 수
  shortFormRatio: number; // 숏폼 비율 (0-1)
  snsRatio: number;
  gameRatio: number;
}

export interface NotificationData {
  importantCount: number;
  lowPriorityCount: number;
  hasOverload: boolean;
}

export interface CheckInData {
  mood: 1 | 2 | 3 | 4 | 5;
  goalAchievement: 1 | 2 | 3 | 4 | 5;
  selfRating: 1 | 2 | 3 | 4 | 5;
}

export interface DailyReport {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  baseScore: number; // 기본 점수
  bonusScore: number; // 연속 달성 보너스
  breakdown: { [key: string]: number }; // 세부 점수
  usage: UsageData;
  notifications: NotificationData;
  checkIn: CheckInData;
  aiComment: string;
  suggestion: string;
  experienceGained: number;
}

export interface UserProfile {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalDays: number;
  currentStreak: number;
  onboarding: OnboardingData;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  experienceReward: number;
}