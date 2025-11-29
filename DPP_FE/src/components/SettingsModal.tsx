import { X, Trash2, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onResetData: () => void;
}

export function SettingsModal({ onClose, onResetData }: SettingsModalProps) {
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
      onResetData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass pixel-card rounded-none p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">⚙️</div>
            <h2 className="leading-tight text-xl">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 glass-dark pixel-btn rounded-none flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Version Info */}
          <div className="glass-dark pixel-card rounded-none p-4">
            <div className="text-xs text-[hsl(var(--text-secondary))] mb-1">Version</div>
            <div className="text-sm">Dolphin Ocean v1.0</div>
          </div>

          {/* Font Info */}
          <div className="glass-dark pixel-card rounded-none p-4">
            <div className="text-xs text-[hsl(var(--text-secondary))] mb-1">Font Style</div>
            <div className="text-sm">Press Start 2P + Pixelify Sans</div>
          </div>

          {/* Reset Data */}
          <div className="glass-dark pixel-card rounded-none p-4">
            <div className="text-xs text-[hsl(var(--text-secondary))] mb-3">Danger Zone</div>
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-[#FF6B6B] text-white pixel-btn rounded-none hover:bg-[#FF5252] transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset All Data</span>
            </button>
          </div>

          {/* Info */}
          <div className="glass-dark pixel-card rounded-none p-4">
            <p className="text-xs leading-relaxed text-[hsl(var(--text-secondary))]">
              🐬 Swimming in the digital ocean since 2024. 
              Keep your ocean life balanced and healthy!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 px-6 bg-[#3DA8C8] text-white pixel-btn rounded-none hover:bg-[#2A8FB0] transition-colors text-xs"
          >
            Back to Ocean
          </button>
        </div>
      </div>
    </div>
  );
}
