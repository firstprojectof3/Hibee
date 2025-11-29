import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DailyReport } from '../types';
import { OceanBackground } from './OceanBackground';

interface CalendarViewProps {
  reports: DailyReport[];
  onSelectReport: (report: DailyReport) => void;
}

export function CalendarView({ reports, onSelectReport }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const getReportForDate = (day: number): DailyReport | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reports.find(r => r.date === dateStr);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-[#48C774]';
    if (score >= 60) return 'bg-[#3DA8C8]';
    if (score >= 30) return 'bg-[#FFB347]';
    return 'bg-[#FF6B6B]';
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const report = getReportForDate(day);
    days.push(
      <button
        key={day}
        onClick={() => report && onSelectReport(report)}
        className={`aspect-square pixel-card rounded-none flex flex-col items-center justify-center transition-all ${
          report
            ? 'glass hover:scale-105 cursor-pointer'
            : 'opacity-30 bg-white/10'
        }`}
      >
        <div className="text-xs mb-1">{day}</div>
        {report && (
          <div
            className={`w-7 h-7 border-2 border-black ${getScoreColor(report.score)} text-white text-xs flex items-center justify-center`}
          >
            {report.score}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen p-6 pb-24 relative">
      <OceanBackground />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="glass pixel-card rounded-none p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-10 h-10 glass-dark pixel-btn rounded-none flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗓️</span>
              <h3 className="leading-tight">
                {year} {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]}
              </h3>
            </div>
            <button
              onClick={nextMonth}
              className="w-10 h-10 glass-dark pixel-btn rounded-none flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs text-[hsl(var(--text-secondary))]">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days}
          </div>
        </div>

        <div className="glass pixel-card rounded-none p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h4>Monthly Voyage Log</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">{reports.filter(r => r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}</div>
              <div className="text-xs text-[hsl(var(--text-secondary))]">Voyages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">
                {reports.filter(r => r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length > 0
                  ? Math.round(
                      reports
                        .filter(r => r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
                        .reduce((sum, r) => sum + r.score, 0) /
                        reports.filter(r => r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length
                    )
                  : 0}
              </div>
              <div className="text-xs text-[hsl(var(--text-secondary))]">Avg Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">
                {reports.filter(r => r.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`) && r.score >= 80).length}
              </div>
              <div className="text-xs text-[hsl(var(--text-secondary))]">Perfect</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}