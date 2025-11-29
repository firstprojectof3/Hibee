import { X, Sparkles, Waves, Moon, Wind, Flame, Target } from 'lucide-react';

interface WorldGuideProps {
  onClose: () => void;
}

export function WorldGuide({ onClose }: WorldGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass pixel-card rounded-none p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🐬</div>
            <h2 className="leading-tight">Dolphin's Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 glass-dark pixel-btn rounded-none flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* World Lore */}
          <div className="glass-dark pixel-card rounded-none p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#3DA8C8]" />
              <h4>World Lore</h4>
            </div>
            <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
              You are a dolphin swimming freely in the blue ocean. Your goal is to maintain a healthy ocean life and grow. 
              Surfacing too often, exploring the deep sea at night, or getting caught in whirlpools will drain your energy. 
              Raise your coral score with balanced ocean life! 🌊
            </p>
          </div>

          {/* Terms */}
          <div>
            <h4 className="mb-3">🐚 Game Terms</h4>
            <div className="space-y-3">
              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Waves className="w-4 h-4 text-[#3DA8C8]" />
                  <div className="text-sm">Surface Time</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Time using your smartphone. Dolphins surface to breathe, but too long makes you tired.
                </p>
              </div>

              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-4 h-4 text-[#3DA8C8]" />
                  <div className="text-sm">Deep Sea</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Usage after bedtime. The deep night sea is dangerous, so avoid exploration.
                </p>
              </div>

              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-[#3DA8C8]" />
                  <div className="text-sm">No-Breath Dive</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Using continuously for 20+ minutes without a break. Come up for air sometimes!
                </p>
              </div>

              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">🌀</div>
                  <div className="text-sm">Whirlpool</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Addictive content like shorts, reels, TikTok. Once caught, hard to escape.
                </p>
              </div>

              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-[#3DA8C8]" />
                  <div className="text-sm">Wave Ride Streak</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Log daily to earn bonus points, like riding consecutive waves!
                </p>
              </div>

              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#3DA8C8]" />
                  <div className="text-sm">Coral Score</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Shows how healthy your day was. Max score is 100!
                </p>
              </div>

              <div className="glass-dark pixel-card rounded-none p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">💧</div>
                  <div className="text-sm">Bubbles</div>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Experience points. Collect bubbles to level up into a magnificent dolphin!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors"
          >
            Back to Ocean
          </button>
        </div>
      </div>
    </div>
  );
}