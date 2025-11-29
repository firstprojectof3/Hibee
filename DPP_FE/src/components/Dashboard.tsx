import { useState, useEffect } from 'react';
import { Smartphone, Clock, Moon, Zap, TrendingUp, Award, HelpCircle, Settings } from 'lucide-react';
import { UsageData, UserProfile } from '../types';
import { calculateCurrentScore, getScoreMessage } from '../utils/scoring';
import { WorldGuide } from './WorldGuide';
import { SettingsModal } from './SettingsModal';
import { OceanBackground } from './OceanBackground';

interface DashboardProps {
  profile: UserProfile;
  todayUsage: UsageData;
  onCheckIn: () => void;
  onResetData: () => void;
}

export function Dashboard({ profile, todayUsage, onCheckIn, onResetData }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentScore = calculateCurrentScore(todayUsage, profile.onboarding);
  const scoreMessage = getScoreMessage(currentScore);

  const usagePercent = (todayUsage.totalTime / profile.onboarding.targetScreenTime) * 100;
  const isOverTarget = usagePercent > 100;

  const hours = Math.floor(todayUsage.totalTime / 60);
  const minutes = todayUsage.totalTime % 60;

  return (
    <div className="min-h-screen p-6 pb-24 relative">
      <OceanBackground />

      {/* Top Right Buttons - Fixed */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setShowGuide(true)}
          className="pixel-icon-btn rounded-none flex items-center justify-center"
          title="Help"
        >
          <span className="text-2xl">?</span>
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="pixel-icon-btn rounded-none flex items-center justify-center"
          title="Settings"
        >
          <span className="text-2xl">⚙️</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 relative z-10 pt-4">
        {/* Header */}
        <div className="glass pixel-card rounded-none p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl">🐬</span>
                <h3 className="leading-tight text-xl">Hello!</h3>
              </div>
              <p className="text-[hsl(var(--text-secondary))] text-sm">
                {currentTime.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-[hsl(var(--text-secondary))] mb-1">Lv.<span className="big-number text-base">{profile.level}</span></div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-4 bg-white/30 border-2 border-black overflow-hidden">
                  <div
                    className="h-full bg-[#3DA8C8] transition-all"
                    style={{ width: `${(profile.experience / profile.experienceToNextLevel) * 100}%` }}
                  />
                </div>
                <span className="text-sm">💧<span className="big-number">{profile.experience}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Coral Score */}
        <div className="glass pixel-card rounded-none p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-5xl">🪸</div>
            <div>
              <h3 className="leading-tight text-xl">Coral Score</h3>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                Live Update
              </p>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="mb-3">
              <span className="big-number text-6xl">{currentScore}</span>
              <span className="text-2xl text-[hsl(var(--text-secondary))]">/100</span>
            </div>
            <div className="text-lg leading-relaxed">{scoreMessage}</div>
          </div>

          <div className="w-full h-8 bg-white/30 border-4 border-black overflow-hidden relative">
            <div
              className={`h-full transition-all ${
                currentScore >= 90
                  ? 'bg-[#48C774]'
                  : currentScore >= 60
                  ? 'bg-[#3DA8C8]'
                  : currentScore >= 30
                  ? 'bg-[#FFB347]'
                  : 'bg-[#FF6B6B]'
              }`}
              style={{ width: `${currentScore}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="big-number text-sm text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{currentScore}%</span>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="glass pixel-card rounded-none p-6">
          <h4 className="mb-4 text-base">🌊 Ocean Log</h4>
          
          {/* Usage Time */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🌊</div>
                <span className="text-sm">Surface Time</span>
              </div>
              <span className="text-sm">
                <span className="big-number">{hours}</span>h <span className="big-number">{minutes}</span>m / <span className="big-number">{Math.floor(profile.onboarding.targetScreenTime / 60)}</span>h <span className="big-number">{profile.onboarding.targetScreenTime % 60}</span>m
              </span>
            </div>
            <div className="w-full h-5 bg-white/30 border-2 border-black overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isOverTarget ? 'bg-[#FF6B6B]' : 'bg-[#3DA8C8]'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass pixel-card rounded-none p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">🌙</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">Deep Sea</div>
            </div>
            <div className="mb-2">
              <span className="big-number text-2xl">{todayUsage.lateNightTime}</span>
              <span className="text-base">m</span>
            </div>
            <div className="text-xs text-[hsl(var(--text-secondary))]">
              -5pts/10m
            </div>
          </div>

          <div className="glass pixel-card rounded-none p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">💨</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">No-Breath</div>
            </div>
            <div className="mb-2">
              <span className="big-number text-2xl">{todayUsage.longSessions}</span>
              <span className="text-base">x</span>
            </div>
            <div className="text-xs text-[hsl(var(--text-secondary))]">
              20min+ sessions
            </div>
          </div>

          <div className="glass pixel-card rounded-none p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">🌀</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">Whirlpool</div>
            </div>
            <div className="mb-2">
              <span className="big-number text-2xl">{(todayUsage.shortFormRatio * 100).toFixed(0)}</span>
              <span className="text-base">%</span>
            </div>
            <div className="text-xs text-[hsl(var(--text-secondary))]">
              -5pts/10%
            </div>
          </div>

          <div className="glass pixel-card rounded-none p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-2xl">🏄</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">Wave Ride</div>
            </div>
            <div className="mb-2">
              <span className="big-number text-2xl">{profile.currentStreak}</span>
              <span className="text-base">d</span>
            </div>
            <div className="text-xs text-[hsl(var(--text-secondary))]">
              +<span className="big-number">{profile.currentStreak * 2}</span>pts
            </div>
          </div>
        </div>

        {/* Check-in Button */}
        <button
          onClick={onCheckIn}
          className="w-full py-6 px-6 pixel-btn-primary rounded-none transition-all text-base"
        >
          <div className="leading-relaxed">🐚 Check-in</div>
          <div className="text-xs opacity-90 mt-2">Record today</div>
        </button>
      </div>

      {showGuide && <WorldGuide onClose={() => setShowGuide(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onResetData={onResetData} />}
    </div>
  );
}