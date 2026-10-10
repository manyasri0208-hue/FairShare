import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Scale,
  UserCheck,
} from 'lucide-react';
import { TaskItem, TeamMember } from '../types';
import { suggestFairSplit, calculateFairness } from '../utils/fairness';
import { FairnessGauge } from './FairnessGauge';
import { WorkloadCharts } from './WorkloadCharts';

interface SuggestionStepProps {
  tasks: TaskItem[];
  members: TeamMember[];
  onApplySplit: (tasks: TaskItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenFormula: () => void;
}

export const SuggestionStep: React.FC<SuggestionStepProps> = ({
  tasks,
  members,
  onApplySplit,
  onNext,
  onBack,
  onOpenFormula,
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [previewTasks, setPreviewTasks] = useState<TaskItem[]>(tasks);

  const previewAnalysis = calculateFairness(members, previewTasks);

  const handleRunAlgorithm = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const balanced = suggestFairSplit(members, tasks);
      setPreviewTasks(balanced);
      onApplySplit(balanced);
      setIsCalculating(false);
      setHasCalculated(true);
    }, 450);
  };

  const isAssigned = tasks.some((t) => t.assignedTo !== null);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Smart Workload Balancing
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            FairShare runs a deterministic algorithm matching member competencies, respecting strict deadlines, and balancing hours proportionally to each member&apos;s available capacity.
          </p>
        </div>

        <button
          type="button"
          disabled={isCalculating}
          onClick={handleRunAlgorithm}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] shrink-0 active:scale-95"
        >
          <Sparkles className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>{hasCalculated || isAssigned ? 'Re-calculate Fair Split' : 'Suggest Fair Split'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FairnessGauge analysis={previewAnalysis} onOpenFormula={onOpenFormula} />
        <WorkloadCharts analysis={previewAnalysis} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            Algorithm Recommendations & Rationales ({previewTasks.length} tasks)
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
            {previewTasks.filter((t) => t.assignedTo).length} assigned
          </span>
        </div>

        {!isAssigned && !hasCalculated ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-70" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ready to distribute tasks
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              Click &quot;Suggest Fair Split&quot; to calculate optimal member assignments with clear plain-language explanations.
            </p>
            <button
              type="button"
              onClick={handleRunAlgorithm}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-xs"
            >
              Run Fair Distribution
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {previewTasks.map((task) => {
              const assignedMember = members.find((m) => m.id === task.assignedTo);

              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {task.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                        {task.requiredSkill}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {task.estimatedHours}h
                      </span>
                    </div>

                    {task.assignmentReason ? (
                      <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">
                          Rationale:
                        </span>
                        <span className="italic">{task.assignmentReason}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">No rationale generated</div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {assignedMember ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: assignedMember.color }}
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {assignedMember.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onApplySplit(previewTasks);
            onNext();
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:gap-3"
        >
          <span>Next: Review & Team Sign-Off</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
