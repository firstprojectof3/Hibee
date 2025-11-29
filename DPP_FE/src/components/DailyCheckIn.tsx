import { useState } from 'react';
import { Heart, Target, Star, ArrowLeft } from 'lucide-react';
import { CheckInData } from '../types';
import { OceanBackground } from './OceanBackground';

interface DailyCheckInProps {
  onComplete: (data: CheckInData) => void;
  onBack: () => void;
}

export function DailyCheckIn({ onComplete, onBack }: DailyCheckInProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [goalAchievement, setGoalAchievement] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [selfRating, setSelfRating] = useState<1 | 2 | 3 | 4 | 5>(3);

  const moods = [
    { value: 1, emoji: '🌊', label: 'Rough Waves' },
    { value: 2, emoji: '🐋', label: 'Want to Rest' },
    { value: 3, emoji: '🐠', label: 'Peaceful' },
    { value: 4, emoji: '🐬', label: 'Exciting' },
    { value: 5, emoji: '✨', label: 'Amazing' }
  ];

  const handleComplete = () => {
    onComplete({
      mood,
      goalAchievement,
      selfRating
    });
  };

  return (
    <div className="min-h-screen p-6 relative">
      <OceanBackground />
      
      <div className="max-w-md mx-auto relative z-10">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[hsl(var(--text-primary))] hover:text-[#3DA8C8] transition-colors px-4 py-2 glass pixel-card rounded-none"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Ocean</span>
        </button>

        <div className="glass pixel-card rounded-none p-8">
          <div className="mb-8">
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-3 flex-1 border-2 border-black ${
                    s <= step ? 'bg-[#3DA8C8]' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🐬</div>
                <div>
                  <h3 className="leading-tight">Today's Mood</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-snug">How was the ocean?</p>
                </div>
              </div>

              <div className="space-y-3">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value as 1 | 2 | 3 | 4 | 5)}
                    className={`w-full p-4 text-sm pixel-btn rounded-none flex items-center gap-4 transition-colors ${
                      mood === m.value
                        ? 'bg-[#3DA8C8] text-white border-black'
                        : 'glass-dark border-white/40 hover:bg-white/25'
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors"
              >
                Next Wave
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="leading-tight">Goal Score</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-snug">How was today's voyage?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setGoalAchievement(rating as 1 | 2 | 3 | 4 | 5)}
                      className={`w-12 h-12 pixel-btn rounded-none flex items-center justify-center transition-all text-xl ${
                        goalAchievement >= rating
                          ? 'bg-[#3DA8C8] text-white border-black scale-110'
                          : 'glass-dark border-white/40'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-[hsl(var(--text-secondary))]">
                  <span>Storm</span>
                  <span>Perfect Voyage</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 px-6 glass-dark pixel-btn rounded-none hover:bg-white/25 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors"
                >
                  Next Wave
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl">⭐</div>
                <div>
                  <h3 className="leading-tight">Star Rating</h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-snug">Give stars</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelfRating(rating as 1 | 2 | 3 | 4 | 5)}
                      className={`transition-all ${
                        selfRating >= rating ? 'scale-125' : 'scale-100 opacity-30'
                      }`}
                    >
                      <Star
                        className={`w-12 h-12 ${
                          selfRating >= rating
                            ? 'fill-[#FFD700] text-[#FFD700]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 px-6 glass-dark pixel-btn rounded-none hover:bg-white/25 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors"
                >
                  Log Complete! 🐚
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}