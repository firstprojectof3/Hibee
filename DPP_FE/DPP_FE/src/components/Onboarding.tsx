import { useState } from 'react';
import { Clock, Moon, Target } from 'lucide-react';
import { OnboardingData } from '../types';
import { OceanBackground } from './OceanBackground';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [targetScreenTime, setTargetScreenTime] = useState(180); // 3시간
  const [targetBedTime, setTargetBedTime] = useState('23:00');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);

  const patterns = [
    'Whirlpools',
    'Endless Currents',
    'Mirages',
    'Deep Sea',
    'Wave Storm',
    'No-Breath Dive'
  ];

  const togglePattern = (pattern: string) => {
    if (selectedPatterns.includes(pattern)) {
      setSelectedPatterns(selectedPatterns.filter(p => p !== pattern));
    } else if (selectedPatterns.length < 2) {
      setSelectedPatterns([...selectedPatterns, pattern]);
    }
  };

  const handleComplete = () => {
    onComplete({
      targetScreenTime,
      targetBedTime,
      patterns: selectedPatterns
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <OceanBackground />
      
      <div className="glass pixel-card rounded-none p-8 max-w-md w-full relative z-10">
        {step === 0 && (
          <div className="text-center space-y-6">
            <div className="text-8xl mb-4 float-animate">🐬</div>
            <h2 className="leading-tight">Dolphin's Ocean Journey</h2>
            <p className="text-[hsl(var(--text-secondary))] leading-relaxed text-sm">
              Welcome! You are now a dolphin swimming in the blue ocean. 
              Let's set some goals for a healthy ocean life! 🌊
            </p>
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors"
            >
              Start Journey
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="mb-8">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-3 flex-1 border-2 border-black ${
                      s <= 1 ? 'bg-[#3DA8C8]' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="text-5xl">🌊</div>
              <div>
                <h3 className="leading-tight">Surface Time</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-snug">
                  How long above water daily?
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl mb-2">
                  {Math.floor(targetScreenTime / 60)}
                  <span className="text-2xl">h</span>{' '}
                  {targetScreenTime % 60}
                  <span className="text-2xl">m</span>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  Dolphins surface often to breathe, but staying too long is tiring.
                  This is your daily screen time goal - time spent on your device.
                </p>
              </div>

              <input
                type="range"
                min="60"
                max="480"
                step="15"
                value={targetScreenTime}
                onChange={(e) => setTargetScreenTime(Number(e.target.value))}
                className="w-full h-4 bg-white/30 border-2 border-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-[#3DA8C8] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors"
              >
                Next Wave
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-8">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-3 flex-1 border-2 border-black ${
                      s <= 2 ? 'bg-[#3DA8C8]' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="text-5xl">🌙</div>
              <div>
                <h3 className="leading-tight">Rest Time</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-snug">Deep sea is dangerous. Rest after this time</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="time"
                value={targetBedTime}
                onChange={(e) => setTargetBedTime(e.target.value)}
                className="w-full p-4 glass-dark border-4 border-white/40 text-center big-number text-2xl focus:outline-none focus:border-[#3DA8C8] rounded-none"
              />

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
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="mb-8">
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-3 flex-1 border-2 border-black ${
                      s <= 3 ? 'bg-[#3DA8C8]' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="text-5xl">⚠️</div>
              <div>
                <h3 className="leading-tight">Dangers to Avoid</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] leading-snug">Pick up to 2</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {patterns.map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => togglePattern(pattern)}
                  className={`p-4 text-sm pixel-btn rounded-none transition-colors ${
                    selectedPatterns.includes(pattern)
                      ? 'bg-[#3DA8C8] text-white border-black'
                      : 'glass-dark border-white/40 hover:bg-white/25'
                  }`}
                >
                  {pattern}
                </button>
              ))}
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
                disabled={selectedPatterns.length === 0}
                className="flex-1 py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dive In! 🐬
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}