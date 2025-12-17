import { UsageData, NotificationData, CheckInData, OnboardingData } from '../types';


export function calculateDailyScore(
  usage: UsageData,
  notifications: NotificationData,
  checkIn: CheckInData,
  onboarding: OnboardingData,
  currentStreak: number = 0
): { baseScore: number; bonusScore: number; totalScore: number; breakdown: { [key: string]: number } } {
  const breakdown: { [key: string]: number } = {};

  // 1. 목표 사용시간 달성도 (20점)
  const timeRatio = usage.totalTime / onboarding.targetScreenTime;
  if (timeRatio <= 1) {
    breakdown.screenTime = 20;
  } else if (timeRatio <= 1.2) {
    breakdown.screenTime = 15;
  } else if (timeRatio <= 1.5) {
    breakdown.screenTime = 10;
  } else if (timeRatio <= 2) {
    breakdown.screenTime = 5;
  } else {
    breakdown.screenTime = 0;
  }

  // 2. 심야 사용 정도 (20점)
  if (usage.lateNightTime === 0) {
    breakdown.lateNight = 20;
  } else if (usage.lateNightTime <= 30) {
    breakdown.lateNight = 15;
  } else if (usage.lateNightTime <= 60) {
    breakdown.lateNight = 10;
  } else if (usage.lateNightTime <= 120) {
    breakdown.lateNight = 5;
  } else {
    breakdown.lateNight = 0;
  }

  // 3. 긴 세션 횟수 (20점)
  if (usage.longSessions <= 1) {
    breakdown.longSessions = 20;
  } else if (usage.longSessions <= 3) {
    breakdown.longSessions = 15;
  } else if (usage.longSessions <= 5) {
    breakdown.longSessions = 10;
  } else if (usage.longSessions <= 8) {
    breakdown.longSessions = 5;
  } else {
    breakdown.longSessions = 0;
  }

  // 4. 숏폼/게임 비율 (20점)
  const addictiveRatio = usage.shortFormRatio + usage.gameRatio;
  if (addictiveRatio <= 0.2) {
    breakdown.shortForm = 20;
  } else if (addictiveRatio <= 0.4) {
    breakdown.shortForm = 15;
  } else if (addictiveRatio <= 0.6) {
    breakdown.shortForm = 10;
  } else if (addictiveRatio <= 0.8) {
    breakdown.shortForm = 5;
  } else {
    breakdown.shortForm = 0;
  }

  // 5. 체크인 달성도 (20점)
  // goalAchieved는 구현/테스트 과정에서 boolean(true/false) 또는 숫자(2~5 등)로 들어올 수 있어
  // 둘 다 안전하게 처리한다.
  const goalAchievedAny = (checkIn as any).goalAchieved;

  if (typeof goalAchievedAny === 'boolean') {
    breakdown.checkIn = goalAchievedAny ? 20 : 0;
  } else if (typeof goalAchievedAny === 'number') {
    if (goalAchievedAny === 5) breakdown.checkIn = 20;
    else if (goalAchievedAny === 4) breakdown.checkIn = 15;
    else if (goalAchievedAny === 3) breakdown.checkIn = 10;
    else if (goalAchievedAny === 2) breakdown.checkIn = 5;
    else breakdown.checkIn = 0;
  } else {
    breakdown.checkIn = 0;
  }

  const baseScore =
    breakdown.screenTime +
    breakdown.lateNight +
    breakdown.longSessions +
    breakdown.shortForm +
    breakdown.checkIn;

  // 연속 달성 보너스 (일차당 점점 증가)
  // 1일: +2, 2일: +4, 3일: +6, ... (2점씩 증가)
  const bonusScore = currentStreak > 0 ? currentStreak * 2 : 0;

  const totalScore = Math.min(100, baseScore + bonusScore);

  return { baseScore, bonusScore, totalScore, breakdown };
}

// 현재 사용 중인 데이터로 실시간 점수 계산 (체크인 없이)
export function calculateCurrentScore(usage: UsageData, onboarding: OnboardingData): number {
  const breakdown: { [key: string]: number } = {};

  // 1. 목표 사용시간 달성도 (20점)
  const timeRatio = usage.totalTime / onboarding.targetScreenTime;
  if (timeRatio <= 1) {
    breakdown.screenTime = 20;
  } else if (timeRatio <= 1.2) {
    breakdown.screenTime = 15;
  } else if (timeRatio <= 1.5) {
    breakdown.screenTime = 10;
  } else if (timeRatio <= 2) {
    breakdown.screenTime = 5;
  } else {
    breakdown.screenTime = 0;
  }

  // 2. 심야 사용 정도 (20점)
  if (usage.lateNightTime === 0) {
    breakdown.lateNight = 20;
  } else if (usage.lateNightTime <= 30) {
    breakdown.lateNight = 15;
  } else if (usage.lateNightTime <= 60) {
    breakdown.lateNight = 10;
  } else if (usage.lateNightTime <= 120) {
    breakdown.lateNight = 5;
  } else {
    breakdown.lateNight = 0;
  }

  // 3. 긴 세션 횟수 (20점)
  if (usage.longSessions <= 1) {
    breakdown.longSessions = 20;
  } else if (usage.longSessions <= 3) {
    breakdown.longSessions = 15;
  } else if (usage.longSessions <= 5) {
    breakdown.longSessions = 10;
  } else if (usage.longSessions <= 8) {
    breakdown.longSessions = 5;
  } else {
    breakdown.longSessions = 0;
  }

  // 4. 숏폼/게임 비율 (20점)
  const addictiveRatio = usage.shortFormRatio + usage.gameRatio;
  if (addictiveRatio <= 0.2) {
    breakdown.shortForm = 20;
  } else if (addictiveRatio <= 0.4) {
    breakdown.shortForm = 15;
  } else if (addictiveRatio <= 0.6) {
    breakdown.shortForm = 10;
  } else if (addictiveRatio <= 0.8) {
    breakdown.shortForm = 5;
  } else {
    breakdown.shortForm = 0;
  }

  const baseScore = breakdown.screenTime + breakdown.lateNight + breakdown.longSessions + breakdown.shortForm;

  // 체크인 없이 계산하므로 기본 점수만
  return Math.min(100, baseScore);
}

export function getScoreTitle(score: number): string {
  if (score >= 91) {
    return '🎉 Perfect Voyage!';
  } else if (score >= 61) {
    return '🐬 Swimming Well!';
  } else if (score >= 31) {
    return '🌊 Keep Swimming!';
  } else {
    return '🐚 Tomorrow Will Be Better';
  }
}

export function generateAIComment(
  score: number,
  usage: UsageData,
  notifications: NotificationData,
  checkIn: CheckInData,
  onboarding: OnboardingData = { targetScreenTime: 180, targetBedTime: "23:00" } as OnboardingData
): { comment: string; suggestion: string } {
  const moodEmoji = ['😔', '😐', '🙂', '😊', '😄'][checkIn.mood - 1];

  let comment = '';
  let suggestion = '';

  if (score >= 90) {
    comment = `${moodEmoji} 훌륭해요! 오늘은 디지털 사용을 정말 잘 조절하셨네요. `;
    if (usage.lateNightTime === 0) {
      comment += '심야 사용도 없었고, ';
    }
    comment += `전체적으로 균형잡힌 하루였습니다.`;
    suggestion = '내일도 이 페이스를 유지해보세요. 잠들기 1시간 전부터는 디바이스를 멀리 두는 것을 추천드려요.';
  } else if (score >= 60) {
    comment = `${moodEmoji} 괜찮은 하루예요. `;
    if (usage.longSessions > 3) {
      comment += '긴 시간 스마트폰을 사용한 세션이 조금 많았네요. ';
    }
    if (usage.shortFormRatio > 0.5) {
      comment += '숏폼 콘텐츠 비중이 높았어요. ';
    }
    comment += `내일은 조금 더 의식적으로 사용 패턴을 조절해보면 좋겠습니다.`;
    suggestion = '내일은 25분 집중 + 5분 휴식 같은 짧은 단위로 스마트폰 사용을 끊어보세요. 특히 숏폼 앱은 시간 제한을 걸어두는 게 효과적이에요.';
  } else {
    comment = `${moodEmoji} 힘든 하루였네요. `;
    if (usage.totalTime > onboarding.targetScreenTime * 2) {
      comment += '사용 시간이 목표보다 훨씬 많았어요. ';
    }
    if (notifications.hasOverload) {
      comment += '알림이 너무 많아서 집중하기 어려웠을 수 있어요. ';
    }
    comment += '괜찮아요, 천천히 개선해나가면 됩니다.';
    suggestion = '내일은 알림을 끄고, 필요할 때만 스마트폰을 확인해보세요. 작은 변화부터 시작하는 것이 중요해요.';
  }

  return { comment, suggestion };
}

export function experienceFromScore(score: number): number {
  return Math.floor(score * 2); // 점수의 2배를 경험치로
}

export function experienceToLevel(level: number): number {
  return 100 * level; // 레벨마다 100씩 증가
}

export const getScoreMessage = getScoreTitle;