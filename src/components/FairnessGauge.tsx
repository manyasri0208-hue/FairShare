import React from 'react';
import { HelpCircle } from 'lucide-react';
import { FairnessAnalysis } from '../types';

interface FairnessGaugeProps {
  analysis: FairnessAnalysis;
  onOpenFormula: () => void;
  size?: number;
}

export const FairnessGauge: React.FC<FairnessGaugeProps> = ({
  analysis,
  onOpenFormula,
  size = 190,
}) => {
  const { score, label, mostLoaded, leastLoaded } = analysis;

  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle; // 240 deg
  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;

  const scoreFraction = Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = arcLength * (1 - scoreFraction);

  let arcColor = '#10B981';
  let arcBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  if (score < 70) {
    arcColor = '#F43F5E';
    arcBg = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  } else if (score < 85) {
    arcColor = '#F59E0B';
    arcBg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const fgPath = bgPath;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Workload Balance
          </span>
          <button
            type="button"
            onClick={onOpenFormula}
            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="How is this calculated?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        <div className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${arcBg}`}>
          {label}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-1 relative">
        <div className="relative" style={{ width: size, height: size * 0.85 }}>
          <svg width={size} height={size} className="overflow-visible">
            <path
              d={bgPath}
              fill="none"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              d={fgPath}
              fill="none"
              stroke={arcColor}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 text-center pointer-events-none">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {score}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              Fairness Score
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-1.5 text-xs">
        {mostLoaded && leastLoaded ? (
          <>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: mostLoaded.member.color }}
                />
                <span className="text-slate-500 dark:text-slate-400">Peak Load:</span>
                <span className="font-semibold truncate max-w-[100px]">{mostLoaded.member.name}</span>
              </span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                {mostLoaded.hours}h ({Math.round(mostLoaded.ratio * 100)}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: leastLoaded.member.color }}
                />
                <span className="text-slate-500 dark:text-slate-400">Lowest Load:</span>
                <span className="font-semibold truncate max-w-[100px]">{leastLoaded.member.name}</span>
              </span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                {leastLoaded.hours}h ({Math.round(leastLoaded.ratio * 100)}%)
              </span>
            </div>
          </>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-center py-1">
            Assign tasks to generate fairness diagnostics
          </p>
        )}
      </div>
    </div>
  );
};
