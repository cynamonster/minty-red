import React, { useState } from 'react';
import { useArcadePass } from '../context/ArcadePassContext';
import { getArchiveHistory, getTodayKey } from '../storage/playerStorage';
import { isDevSite } from '../utils/environment';
import {
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Lock,
  Check,
  Star,
  Sparkles,
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function GameArchivePicker({
  gameSlug = 'default',
  isOpen = false,
  onClose,
  onSelectDate,
  launchYear = 2026,
  launchMonth = 0, // January (0-indexed)
}) {
  const { isPassHolder, openPassModal } = useArcadePass();
  const todayKey = getTodayKey();
  const [todayYear, todayMonthNum, todayDayNum] = todayKey.split('-').map(Number);

  const [currentYear, setCurrentYear] = useState(todayYear);
  const [currentMonth, setCurrentMonth] = useState(todayMonthNum - 1); // 0-indexed

  if (!isOpen) return null;

  const archiveHistory = getArchiveHistory(gameSlug);

  // Month navigation bounds
  const canGoBack =
    currentYear > launchYear || (currentYear === launchYear && currentMonth > launchMonth);
  const canGoForward =
    currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonthNum - 1);

  const handlePrevMonth = () => {
    if (!canGoBack) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canGoForward) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate calendar days
  const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
  const firstDayOfWeek = new Date(Date.UTC(currentYear, currentMonth, 1)).getUTCDay();

  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (dateStr > todayKey) return; // Future date

    if (dateStr === todayKey) {
      onSelectDate(dateStr);
      onClose();
      return;
    }

    if (!isPassHolder && !isDevSite()) {
      openPassModal('plans', `Unlock past daily archives with the Minty Arcade Pass`);
      return;
    }

    onSelectDate(dateStr);
    onClose();
  };

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Daily Archive</span>
                {(isPassHolder || isDevSite()) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold uppercase">
                    {isPassHolder ? 'Pass Active' : 'Dev Mode'}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Replay any past daily puzzle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={handlePrevMonth}
            disabled={!canGoBack}
            className="p-1.5 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white tracking-wide">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={!canGoForward}
            className="p-1.5 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-500 pb-1.5 uppercase">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="w-full h-9" />
          ))}

          {/* Calendar Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayKey;
            const isFuture = dateStr > todayKey;
            const completedRecord = archiveHistory[dateStr];
            const isCompleted = Boolean(completedRecord);

            if (isFuture) {
              return (
                <div
                  key={day}
                  className="w-full h-9 rounded-xl flex items-center justify-center text-[11px] font-mono text-slate-700 bg-slate-950/20"
                >
                  {day}
                </div>
              );
            }

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`relative w-full h-9 rounded-xl flex flex-col items-center justify-center text-[11px] font-mono font-bold transition-all active:scale-95 ${
                  isToday
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : isCompleted
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <span>{day}</span>
                {isCompleted && !isToday && (
                  <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                )}
                {!isPassHolder && !isDevSite() && !isToday && !isCompleted && (
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Teaser Footer if free user */}
        {!isPassHolder && !isDevSite() && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[10px] text-amber-200/90 font-medium leading-tight">
                Past daily puzzles require the Arcade Pass.
              </p>
            </div>
            <button
              onClick={() => openPassModal('plans', 'Unlock the full daily puzzle archive')}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0"
            >
              Unlock
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameArchivePicker;
