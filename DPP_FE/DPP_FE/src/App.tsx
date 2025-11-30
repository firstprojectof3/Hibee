import { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { DailyCheckIn } from './components/DailyCheckIn';
import { CalendarView } from './components/CalendarView';
import { ProfileView } from './components/ProfileView';
import { ReportView } from './components/ReportView';
import { BottomNav } from './components/BottomNav';
import { OnboardingData, UsageData, NotificationData, CheckInData, DailyReport, UserProfile } from './types';
import { calculateDailyScore, generateAIComment, experienceFromScore, experienceToLevel } from './utils/scoring';
import { requestAiComment } from './api/ai';
import type { AiCommentRequest } from './api/ai';

type View = 'onboarding' | 'dashboard' | 'checkIn' | 'calendar' | 'profile' | 'report';

function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayUsage, setTodayUsage] = useState<UsageData>({
    totalTime: 0,
    lateNightTime: 0,
    longSessions: 0,
    shortFormRatio: 0,
    snsRatio: 0,
    gameRatio: 0
  });
  const [todayNotifications, setTodayNotifications] = useState<NotificationData>({
    importantCount: 0,
    lowPriorityCount: 0,
    hasOverload: false
  });
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const savedProfile = localStorage.getItem('digitalWellbeingProfile');
    const savedReports = localStorage.getItem('digitalWellbeingReports');
    const savedUsage = localStorage.getItem('digitalWellbeingTodayUsage');

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setCurrentView('dashboard');
    }
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
    if (savedUsage) {
      setTodayUsage(JSON.parse(savedUsage));
    }

    // 개발용: URL에 ?reset=true 를 추가하면 모든 데이터 초기화
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      localStorage.clear();
      window.location.href = window.location.pathname;
    }
  }, []);

  // 데모용: 사용 데이터를 시뮬레이션
  useEffect(() => {
    if (profile) {
      const interval = setInterval(() => {
        setTodayUsage(prev => ({
          ...prev,
          totalTime: prev.totalTime + Math.floor(Math.random() * 5),
          lateNightTime: prev.lateNightTime + (new Date().getHours() >= parseInt(profile.onboarding.targetBedTime.split(':')[0]) ? Math.floor(Math.random() * 2) : 0),
          longSessions: prev.longSessions + (Math.random() > 0.95 ? 1 : 0),
          shortFormRatio: Math.min(1, prev.shortFormRatio + (Math.random() > 0.9 ? 0.05 : 0)),
          snsRatio: Math.min(1, prev.snsRatio + (Math.random() > 0.9 ? 0.03 : 0)),
          gameRatio: Math.min(1, prev.gameRatio + (Math.random() > 0.95 ? 0.02 : 0))
        }));
      }, 10000); // 10초마다 업데이트

      return () => clearInterval(interval);
    }
  }, [profile]);

  // 사용 데이터 저장
  useEffect(() => {
    if (profile) {
      localStorage.setItem('digitalWellbeingTodayUsage', JSON.stringify(todayUsage));
    }
  }, [todayUsage, profile]);

  const handleOnboardingComplete = (data: OnboardingData) => {
    const newProfile: UserProfile = {
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      totalDays: 0,
      currentStreak: 0,
      onboarding: data
    };
    setProfile(newProfile);
    localStorage.setItem('digitalWellbeingProfile', JSON.stringify(newProfile));
    setCurrentView('dashboard');
  };

  const handleCheckInComplete = async (checkInData: CheckInData) => {
  if (!profile) return;

  const { baseScore, bonusScore, totalScore, breakdown } = calculateDailyScore(
    todayUsage,
    todayNotifications,
    checkInData,
    profile.onboarding,
    profile.currentStreak
  );

  let comment: string;
  let suggestion: string;

  try {
    const todayDate = new Date().toISOString().split("T")[0];
    const userId = "1234"; // 지금은 테스트용, 나중에 실제 유저 ID로 교체

    const aiPayload: AiCommentRequest = {
      user_id: userId,
      date: todayDate,
      totalScore,
      usage: todayUsage,
      notifications: todayNotifications,
      checkIn: {
        mood: checkInData.mood ?? 3,
        satisfaction: checkInData.satisfaction ?? 3,
        goalAchieved: checkInData.goalAchieved ?? false,
        memo: checkInData.memo ?? "",
      },
      profile,
    };

    const aiRes = await requestAiComment(aiPayload);

    console.log("🧠 AI raw response:", aiRes);

    comment = aiRes.comment;
    suggestion = aiRes.suggestion;

    console.log("🧠 저장할 코멘트:", comment);
    console.log("🧠 저장할 제안:", suggestion);
  } catch (error) {
    console.error("AI 요청 실패, 로컬 generateAIComment 사용", error);
    const local = generateAIComment(
      totalScore,
      todayUsage,
      todayNotifications,
      checkInData
    );
    comment = local.comment;
    suggestion = local.suggestion;
  }

  const exp = experienceFromScore(totalScore);

  const newReport: DailyReport = {
    date: new Date().toISOString().split("T")[0],
    score: totalScore,
    baseScore,
    bonusScore,
    breakdown,
    usage: todayUsage,
    notifications: todayNotifications,
    checkIn: checkInData,
    aiComment: comment,      // 🔥 여기서 AI 코멘트 저장
    suggestion,              // 🔥 여기서 AI 제안 저장
    experienceGained: exp,
  };

  console.log("📘 Report에 저장된 aiComment:", newReport.aiComment);
  console.log("📘 Report에 저장된 suggestion:", newReport.suggestion);

  const updatedReports = [...reports, newReport];
  setReports(updatedReports);
  localStorage.setItem(
    "digitalWellbeingReports",
    JSON.stringify(updatedReports)
  );

  let newExp = profile.experience + exp;
  let newLevel = profile.level;
  let expToNext = profile.experienceToNextLevel;

  while (newExp >= expToNext) {
    newExp -= expToNext;
    newLevel++;
    expToNext = experienceToLevel(newLevel);
  }

  const lastReport = reports[reports.length - 1];
  const isConsecutive =
    lastReport &&
    new Date(newReport.date).getTime() -
      new Date(lastReport.date).getTime() ===
      86400000;

  const updatedProfile: UserProfile = {
    ...profile,
    level: newLevel,
    experience: newExp,
    experienceToNextLevel: expToNext,
    totalDays: profile.totalDays + 1,
    currentStreak: isConsecutive ? profile.currentStreak + 1 : 1,
  };

  setProfile(updatedProfile);
  localStorage.setItem(
    "digitalWellbeingProfile",
    JSON.stringify(updatedProfile)
  );

  setSelectedReport(newReport);
  setCurrentView("report");

  setTodayUsage({
    totalTime: 0,
    lateNightTime: 0,
    longSessions: 0,
    shortFormRatio: 0,
    snsRatio: 0,
    gameRatio: 0,
  });
};



  const handleNavigate = (view: 'dashboard' | 'calendar' | 'profile') => {
    setCurrentView(view);
  };

  const handleSelectReport = (report: DailyReport) => {
    setSelectedReport(report);
    setCurrentView('report');
  };

  const handleResetData = () => {
    localStorage.clear();
    setProfile(null);
    setReports([]);
    setTodayUsage({
      totalTime: 0,
      lateNightTime: 0,
      longSessions: 0,
      shortFormRatio: 0,
      snsRatio: 0,
      gameRatio: 0
    });
    setCurrentView('onboarding');
  };

  if (currentView === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (currentView === 'checkIn') {
    return (
      <DailyCheckIn
        onComplete={handleCheckInComplete}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'report' && selectedReport) {
    return (
      <ReportView
        report={selectedReport}
        onClose={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          profile={profile}
          todayUsage={todayUsage}
          onCheckIn={() => setCurrentView('checkIn')}
          onResetData={handleResetData}
        />
      )}

      {currentView === 'calendar' && (
        <CalendarView
          reports={reports}
          onSelectReport={handleSelectReport}
        />
      )}

      {currentView === 'profile' && (
        <ProfileView profile={profile} />
      )}

      <BottomNav
        currentView={currentView as 'dashboard' | 'calendar' | 'profile'}
        onNavigate={handleNavigate}
      />
    </>
  );
}

export default App;