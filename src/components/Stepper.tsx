import React from 'react';
import { Users, CheckSquare, Sparkles, SlidersHorizontal, LayoutDashboard, Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  isApproved: boolean;
  tasksCount: number;
  membersCount: number;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepChange,
  isApproved,
  tasksCount,
  membersCount,
}) => {
  const steps = [
    {
      id: 1,
      label: 'Team Setup',
      icon: Users,
      badge: `${membersCount} members`,
    },
    {
      id: 2,
      label: 'Tasks & AI',
      icon: CheckSquare,
      badge: `${tasksCount} tasks`,
    },
    {
      id: 3,
      label: 'Smart Split',
      icon: Sparkles,
      badge: 'Algorithm',
    },
    {
      id: 4,
      label: 'Review & Sign-Off',
      icon: SlidersHorizontal,
      badge: isApproved ? 'Approved' : 'Pending',
    },
    {
      id: 5,
      label: 'Project Dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between sm:justify-start sm:gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <li key={step.id} className="flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => onStepChange(step.id)}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all w-full sm:w-auto ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 ring-1 ring-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : isPast
                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isPast
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </span>

                    <div className="hidden sm:block min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">
                        {step.label}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {step.badge}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
