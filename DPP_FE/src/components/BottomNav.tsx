import { Home, Calendar, User } from 'lucide-react';

interface BottomNavProps {
  currentView: 'dashboard' | 'calendar' | 'profile';
  onNavigate: (view: 'dashboard' | 'calendar' | 'profile') => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Log' },
    { id: 'profile', icon: User, label: 'Profile' }
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="max-w-2xl mx-auto glass pixel-card rounded-none p-4">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 pixel-btn rounded-none transition-all ${
                  isActive
                    ? 'bg-[#3DA8C8] text-white border-black'
                    : 'glass-dark border-white/40 hover:bg-white/25'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}