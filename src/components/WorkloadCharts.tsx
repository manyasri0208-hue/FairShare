import React, { useState } from 'react';
import { PieChart, Clock } from 'lucide-react';
import { FairnessAnalysis } from '../types';

interface WorkloadChartsProps {
  analysis: FairnessAnalysis;
}

export const WorkloadCharts: React.FC<WorkloadChartsProps> = ({ analysis }) => {
  const { memberLoads, totalAssignedHours, totalAvailableHours } = analysis;
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  const size = 190;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;
  const segments = memberLoads.map((ml) => {
    const fraction = totalAssignedHours > 0 ? ml.assignedHours / totalAssignedHours : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;
    accumulatedAngle += fraction * circumference;

    return {
      ...ml,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-indigo-500" />
          Hours Distribution
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
          {totalAssignedHours}h / {totalAvailableHours}h total
        </span>
      </div>

      {totalAssignedHours === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 text-xs">
          <Clock className="w-8 h-8 mb-2 opacity-50" />
          No tasks assigned yet.
          <span className="text-[11px] mt-0.5 text-slate-400">
            Suggest a split or assign tasks to see workload breakdown.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto">
          <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth={strokeWidth}
                />
                {segments.map((seg) => {
                  const isHovered = activeMemberId === seg.member.id;
                  return (
                    <circle
                      key={seg.member.id}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="transparent"
                      stroke={seg.member.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveMemberId(seg.member.id)}
                      onMouseLeave={() => setActiveMemberId(null)}
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800 dark:text-white font-mono">
                  {totalAssignedHours}h
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Assigned
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-7 space-y-2.5">
            {memberLoads.map((ml) => {
              const isOverloaded = ml.assignedHours > ml.availableHours;
              const isHovered = activeMemberId === ml.member.id;

              return (
                <div
                  key={ml.member.id}
                  onMouseEnter={() => setActiveMemberId(ml.member.id)}
                  onMouseLeave={() => setActiveMemberId(null)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-50 dark:bg-slate-800/80 ring-1 ring-slate-200 dark:ring-slate-700'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: ml.member.color }}
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {ml.member.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
                      <span className="text-slate-500 dark:text-slate-400">
                        {ml.assignedHours}h / {ml.availableHours}h
                      </span>
                      <span
                        className={`font-semibold ${
                          isOverloaded
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {Math.round(ml.loadRatio * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (ml.assignedHours / ml.availableHours) * 100)}%`,
                        backgroundColor: ml.member.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>Capacity load targets uniform ratios across all members</span>
        <span className="font-mono">
          Overall team fill:{' '}
          {totalAvailableHours > 0
            ? Math.round((totalAssignedHours / totalAvailableHours) * 100)
            : 0}
          %
        </span>
      </div>
    </div>
  );
};
