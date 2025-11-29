import { Award, Flame, Target, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';
import { OceanBackground } from './OceanBackground';

interface ProfileViewProps {
  profile: UserProfile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const levelProgress = (profile.experience / profile.experienceToNextLevel) * 100;

  return (
    <div className="min-h-screen p-6 pb-24 relative">
      <OceanBackground />
      
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        {/* Level Card */}
        <div className="glass pixel-card rounded-none p-8">
          <div className="text-center mb-6">
            <div className="text-8xl mb-4">🐬</div>
            <h2 className="mb-2 leading-tight">Growth Lv.{profile.level}</h2>
            <p className="text-[hsl(var(--text-secondary))] text-sm">Ocean Dolphin</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[hsl(var(--text-secondary))]">💧 Bubbles (XP)</span>
              <span>{profile.experience} / {profile.experienceToNextLevel}</span>
            </div>
            <div className="w-full h-4 bg-white/30 border-2 border-black overflow-hidden">
              <div
                className="h-full bg-[#3DA8C8] transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass pixel-card rounded-none p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">🏄</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">Wave Streak</div>
            </div>
            <div className="text-3xl">{profile.currentStreak}d</div>
          </div>

          <div className="glass pixel-card rounded-none p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">📅</div>
              <div className="text-sm text-[hsl(var(--text-secondary))]">Total Days</div>
            </div>
            <div className="text-3xl">{profile.totalDays}d</div>
          </div>
        </div>

        {/* Goals */}
        <div className="glass pixel-card rounded-none p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🎯</div>
            <h4>My Route</h4>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(var(--text-secondary))]">🌊 Surface Time Goal</span>
              <span>
                {Math.floor(profile.onboarding.targetScreenTime / 60)}h{' '}
                {profile.onboarding.targetScreenTime % 60}m
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[hsl(var(--text-secondary))]">🌙 Rest Time</span>
              <span>{profile.onboarding.targetBedTime}</span>
            </div>
            <div>
              <div className="text-[hsl(var(--text-secondary))] mb-2 text-sm">⚠️ Avoiding</div>
              <div className="flex gap-2 flex-wrap">
                {profile.onboarding.patterns.map((pattern) => (
                  <div
                    key={pattern}
                    className="px-3 py-1 glass-dark pixel-card rounded-none text-xs"
                  >
                    {pattern}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="glass pixel-card rounded-none p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h4>Weekly Challenges</h4>
          </div>
          <div className="space-y-3">
            <div className="glass-dark pixel-card rounded-none p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>🐬 7 Days Voyage</span>
                <span className="text-xs text-[hsl(var(--text-secondary))]">{Math.min(profile.currentStreak, 7)}/7</span>
              </div>
              <div className="w-full h-2 bg-white/30 border-2 border-black overflow-hidden">
                <div
                  className="h-full bg-[#3DA8C8]"
                  style={{ width: `${(Math.min(profile.currentStreak, 7) / 7) * 100}%` }}
                />
              </div>
            </div>

            <div className="glass-dark pixel-card rounded-none p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>🪸 80pts 3 Days</span>
                <span className="text-xs text-[hsl(var(--text-secondary))]">0/3</span>
              </div>
              <div className="w-full h-2 bg-white/30 border-2 border-black overflow-hidden">
                <div className="h-full bg-[#3DA8C8]" style={{ width: '0%' }} />
              </div>
            </div>

            <div className="glass-dark pixel-card rounded-none p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>🌙 0m Deep Sea</span>
                <span className="text-xs text-[hsl(var(--text-secondary))]">0/1</span>
              </div>
              <div className="w-full h-2 bg-white/30 border-2 border-black overflow-hidden">
                <div className="h-full bg-[#3DA8C8]" style={{ width: '0%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}