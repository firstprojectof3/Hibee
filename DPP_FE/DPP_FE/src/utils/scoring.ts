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

  // 2. 심야 사용 (20점 만점, 10분당 5점씩 감점)
  breakdown.lateNight = Math.max(0, 20 - Math.floor(usage.lateNightTime / 10) * 5);

  // 3. 연속 사용 세션 (20점 만점)
  if (usage.longSessions === 0) {
    breakdown.longSessions = 20;
  } else if (usage.longSessions === 1) {
    breakdown.longSessions = 15;
  } else if (usage.longSessions === 2) {
    breakdown.longSessions = 10;
  } else if (usage.longSessions === 3) {
    breakdown.longSessions = 5;
  } else {
    breakdown.longSessions = 0;
  }

  // 4. 숏폼 비율 (20점 만점, 10%당 5점씩 감점)
  breakdown.shortForm = Math.max(0, 20 - Math.floor(usage.shortFormRatio * 10) * 5);

  // 5. 체크인 달성도 (20점)
  if (checkIn.goalAchievement === 5) {
    breakdown.checkIn = 20;
  } else if (checkIn.goalAchievement === 4) {
    breakdown.checkIn = 15;
  } else if (checkIn.goalAchievement === 3) {
    breakdown.checkIn = 10;
  } else if (checkIn.goalAchievement === 2) {
    breakdown.checkIn = 5;
  } else {
    breakdown.checkIn = 0;
  }

  const baseScore = breakdown.screenTime + breakdown.lateNight + breakdown.longSessions + breakdown.shortForm + breakdown.checkIn;

  // 연속 달성 보너스 (일차당 점점 증가)
  // 1일: +2, 2일: +4, 3일: +6, ... (2점씩 증가)
  const bonusScore = currentStreak > 0 ? currentStreak * 2 : 0;

  const totalScore = Math.min(100, baseScore + bonusScore);

  return { baseScore, bonusScore, totalScore, breakdown };
}

// 현재 사용 중인 데이터로 실시간 점수 계산 (체크인 없이)
export function calculateCurrentScore(
  usage: UsageData,
  onboarding: OnboardingData
): number {
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

  // 2. 심야 사용 (20점 만점, 10분당 5점씩 감점)
  breakdown.lateNight = Math.max(0, 20 - Math.floor(usage.lateNightTime / 10) * 5);

  // 3. 연속 사용 세션 (20점 만점)
  if (usage.longSessions === 0) {
    breakdown.longSessions = 20;
  } else if (usage.longSessions === 1) {
    breakdown.longSessions = 15;
  } else if (usage.longSessions === 2) {
    breakdown.longSessions = 10;
  } else if (usage.longSessions === 3) {
    breakdown.longSessions = 5;
  } else {
    breakdown.longSessions = 0;
  }

  // 4. 숏폼 비율 (20점 만점, 10%당 5점씩 감점)
  breakdown.shortForm = Math.max(0, 20 - Math.floor(usage.shortFormRatio * 10) * 5);

  // 체크인 점수는 제외 (80점 만점으로 계산 후 100점 기준으로 환산)
  const currentScore = breakdown.screenTime + breakdown.lateNight + breakdown.longSessions + breakdown.shortForm;
  
  // 80점 만점을 100점으로 환산
  return Math.round((currentScore / 80) * 100);
}

export function getScoreMessage(score: number): string {
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
  checkIn: CheckInData
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
      comment += '다만 연속 사용 시간이 조금 길었네요. ';
    }
    if (usage.shortFormRatio > 0.4) {
      comment += '숏폼 콘텐츠에 시간을 많이 보내셨어요. ';
    }
    comment += '조금만 더 의식적으로 사용해보면 좋겠어요.';
    suggestion = '내일은 20분마다 알림을 설정하고, 알림이 울리면 5분간 휴식을 취해보세요.';
  } else if (score >= 30) {
    comment = `${moodEmoji} 오늘은 조금 힘든 하루였나봐요. `;
    if (usage.lateNightTime > 30) {
      comment += '심야 사용이 많아 수면에 영향이 있을 수 있어요. ';
    }
    if (notifications.hasOverload) {
      comment += '알림도 많이 왔네요. ';
    }
    comment += '내일은 더 나아질 거예요.';
    suggestion = '취침 30분 전에 스마트폰을 다른 방에 두고, 종이책이나 명상으로 하루를 마무리해보세요.';
  } else {
    comment = `${moodEmoji} 힘든 하루였네요. `;
    if (usage.totalTime > onboarding.targetScreenTime * 2) {
      comment += '사용 시간이 목표의 2배를 넘었어요. ';
    }
    if (usage.lateNightTime > 60) {
      comment += '심야 사용이 특히 많았습니다. ';
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