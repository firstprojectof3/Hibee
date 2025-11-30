import { Sparkles, TrendingUp, ArrowLeft, Award } from 'lucide-react';
import { DailyReport } from '../types';
import { getScoreMessage } from '../utils/scoring';
import { OceanBackground } from './OceanBackground';

interface ReportViewProps {
  report: DailyReport;
  onClose: () => void;
}

export function ReportView({ report, onClose }: ReportViewProps) {
  const scorePercent = (report.score / 100) * 100;
  const scoreMessage = getScoreMessage(report.score);

  const moodEmojis = ['🌊', '🐋', '🐠', '🐬', '✨'];

  return (
    <div className="min-h-screen p-6 relative">
      <OceanBackground />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <button
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-[hsl(var(--text-primary))] hover:text-[#3DA8C8] transition-colors px-4 py-2 glass pixel-card rounded-none"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Ocean</span>
        </button>

        <div className="space-y-6">
          {/* Score Card */}
          <div className="glass pixel-card rounded-none p-8 text-center">
            <div className="mb-4">
              <div className="text-sm text-[hsl(var(--text-secondary))] mb-2">
                {new Date(report.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">🪸</span>
                <h2 className="leading-tight">Coral Score</h2>
              </div>
            </div>

            <div className="text-7xl mb-4">{report.score}</div>
            <div className="text-xl mb-6">{scoreMessage}</div>

            <div className="flex justify-center gap-3 flex-wrap">
              <div className="glass-dark pixel-card rounded-none px-4 py-2">
                <div className="text-xs text-[hsl(var(--text-secondary))]">Base</div>
                <div className="text-lg">{report.baseScore}pts</div>
              </div>
              {report.bonusScore > 0 && (
                <div className="glass-dark pixel-card rounded-none px-4 py-2">
                  <div className="text-xs text-[hsl(var(--text-secondary))]">Wave Bonus</div>
                  <div className="text-lg text-[#48C774]">+{report.bonusScore}pts</div>
                </div>
              )}
              <div className="glass-dark pixel-card rounded-none px-4 py-2">
                <div className="text-lg">💧 +{report.experienceGained}</div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="glass pixel-card rounded-none p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📊</div>
              <h4>Score Breakdown</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-secondary))] text-sm">🌊 Surface Time</span>
                <span className="text-xl">{report.breakdown.screenTime}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-secondary))] text-sm">🌙 Deep Sea</span>
                <span className="text-xl">{report.breakdown.lateNight}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-secondary))] text-sm">💨 No-Breath</span>
                <span className="text-xl">{report.breakdown.longSessions}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-secondary))] text-sm">🌀 Whirlpool</span>
                <span className="text-xl">{report.breakdown.shortForm}/20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[hsl(var(--text-secondary))] text-sm">🎯 Check-in</span>
                <span className="text-xl">{report.breakdown.checkIn}/20</span>
              </div>
            </div>
          </div>

          {/* AI Comment */}
          <div className="glass pixel-card rounded-none p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🐠</div>
              <h4>Today's Log</h4>
            </div>
            <p className="leading-relaxed text-sm">{report.aiComment}</p>
          </div>

          {/* Tomorrow's Route */}
          <div className="glass pixel-card rounded-none p-6 bg-white/10">
            <h4 className="mb-3">💡 Tomorrow's Route</h4>
            <p className="leading-relaxed text-sm">{report.suggestion}</p>
          </div>

          {/* Details */}
          <div className="glass pixel-card rounded-none p-6">
            <h4 className="mb-4">🐚 Detailed Log</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--text-secondary))]">Total Surface Time</span>
                <span>{Math.floor(report.usage.totalTime / 60)}h {report.usage.totalTime % 60}m</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--text-secondary))]">Deep Sea Time</span>
                <span>{report.usage.lateNightTime}m</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--text-secondary))]">No-Breath Dives</span>
                <span>{report.usage.longSessions}x</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--text-secondary))]">Whirlpool %</span>
                <span>{(report.usage.shortFormRatio * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[hsl(var(--text-secondary))]">Today's Mood</span>
                <span className="text-2xl">{moodEmojis[report.checkIn.mood - 1]}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 px-6 glass-dark pixel-btn rounded-none hover:bg-white/25 transition-colors"
          >
            Back to Ocean
          </button>
        </div>
      </div>
    </div>
  );
}