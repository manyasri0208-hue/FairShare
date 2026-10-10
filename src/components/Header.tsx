import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  Moon,
  Sun,
  RotateCcw,
  Share2,
  Clock,
  Check,
} from 'lucide-react';
import { ProjectState, FairnessAnalysis } from '../types';

interface HeaderProps {
  project: ProjectState;
  analysis: FairnessAnalysis;
  onLoadDemo: () => void;
  onReset: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  analysis,
  onLoadDemo,
  onReset,
  darkMode,
  onToggleDarkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      if (!project.deadline) {
        setCountdownText('No deadline set');
        return;
      }
      const target = new Date(`${project.deadline}T23:59:59`).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownText('Deadline passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdownText(`${days}d ${hours}h remaining`);
      } else {
        setCountdownText(`${hours}h ${minutes}m left!`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [project.deadline]);

  const handleCopyWhatsAppSummary = () => {
    const lines = [
      `📊 *FairShare Summary: ${project.name || 'Group Project'}*`,
      `📅 Deadline: ${project.deadline || 'TBD'} (${countdownText})`,
      `⚖️ Fairness Score: ${analysis.score}/100 (${analysis.label})`,
      `⏱️ Total Effort: ${analysis.totalAssignedHours}h / ${analysis.totalAvailableHours}h capacity`,
      '',
      '*Team Workload Split:*',
    ];

    analysis.memberLoads.forEach((ml) => {
      const assignedTasks = project.tasks.filter((t) => t.assignedTo === ml.member.id);
      lines.push(
        `• *${ml.member.name}*: ${ml.assignedHours}h (${Math.round(ml.loadRatio * 100)}% load, ${
          assignedTasks.length
        } tasks)`
      );
      assignedTasks.forEach((t) => {
        lines.push(`   └ [${t.status === 'done' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳'}] ${t.title} (${t.estimatedHours}h, due ${t.deadline || 'N/A'})`);
      });
    });

    lines.push('');
    lines.push('Shared via FairShare ⚖️');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                FairShare
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                Student Workload
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {project.name || 'Untitled Project'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {project.deadline && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{countdownText}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopyWhatsAppSummary}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs"
            title="Copy formatted WhatsApp summary to paste in team group chat"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy for WhatsApp</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onLoadDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-950/60 dark:to-teal-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs hover:shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="hidden xs:inline">Load</span> Demo Team
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Reset Project"
            aria-label="Reset project"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
