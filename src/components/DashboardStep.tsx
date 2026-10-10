import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  ArrowLeft,
  Filter,
  CheckCircle,
  PlayCircle,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, TaskStatus, TeamMember } from '../types';
import { calculateFairness } from '../utils/fairness';
import { FairnessGauge } from './FairnessGauge';
import { WorkloadCharts } from './WorkloadCharts';

interface DashboardStepProps {
  tasks: TaskItem[];
  members: TeamMember[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  projectName: string;
  projectDeadline: string;
  onBackToReview: () => void;
  onOpenFormula: () => void;
}

export const DashboardStep: React.FC<DashboardStepProps> = ({
  tasks,
  members,
  onUpdateTasks,
  projectDeadline,
  onBackToReview,
  onOpenFormula,
}) => {
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [countdownText, setCountdownText] = useState('');

  const analysis = calculateFairness(members, tasks);

  useEffect(() => {
    const update = () => {
      if (!projectDeadline) {
        setCountdownText('No deadline set');
        return;
      }
      const target = new Date(`${projectDeadline}T23:59:59`).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownText('Due Today / Passed');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdownText(`${days} days, ${hours} hours remaining`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [projectDeadline]);

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    onUpdateTasks(updated);

    if (newStatus === 'done') {
      const allDone = updated.every((t) => t.status === 'done');
      if (allDone) {
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch {}
      }
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedMemberFilter === 'all') return true;
    return t.assignedTo === selectedMemberFilter;
  });

  const doneTasks = tasks.filter((t) => t.status === 'done');
  const completedHours = doneTasks.reduce((acc, t) => acc + (Number(t.estimatedHours) || 0), 0);
  const totalHours = tasks.reduce((acc, t) => acc + (Number(t.estimatedHours) || 0), 0);
  const progressPercent = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  const kanbanColumns: { id: TaskStatus; label: string; icon: any; color: string; bg: string }[] = [
    {
      id: 'todo',
      label: 'To Do',
      icon: Clock,
      color: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800',
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      icon: PlayCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-950/60',
    },
    {
      id: 'done',
      label: 'Completed',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                5. Project Execution Dashboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Live status tracking. Team members update deliverables from To Do to Done with zero workload surprises.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 shrink-0">
            <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Final Submission
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                {countdownText}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Overall Project Deliverables Complete
            </span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {doneTasks.length} / {tasks.length} tasks ({progressPercent}% effort done)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FairnessGauge analysis={analysis} onOpenFormula={onOpenFormula} />
        <WorkloadCharts analysis={analysis} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Team Member Progress
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Assigned hours vs weekly availability
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignedTo === member.id);
            const memberDone = memberTasks.filter((t) => t.status === 'done');
            const memberHours = memberTasks.reduce(
              (acc, t) => acc + (Number(t.estimatedHours) || 0),
              0
            );
            const availableHours = Math.max(1, member.availableHoursPerWeek);
            const loadRatio = memberHours / availableHours;

            return (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {member.name}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {memberDone.length} / {memberTasks.length} tasks done
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {Math.round(loadRatio * 100)}% load
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (memberHours / availableHours) * 100)}%`,
                      backgroundColor: member.color,
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                  {memberTasks.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No tasks assigned</span>
                  ) : (
                    memberTasks.map((t) => (
                      <span
                        key={t.id}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 ${
                          t.status === 'done'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 line-through opacity-80'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: member.color }}
                        />
                        <span className="truncate max-w-[130px]">{t.title}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Project Kanban Board
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Members ({tasks.length} tasks)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({tasks.filter((t) => t.assignedTo === m.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col min-h-[300px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${col.bg} ${col.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {col.label}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs italic border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No tasks in {col.label.toLowerCase()}
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const member = members.find((m) => m.id === task.assignedTo);

                      return (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:shadow-xs transition-all"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: member ? member.color : '#94A3B8',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h5
                              className={`font-bold text-xs text-slate-900 dark:text-white leading-snug flex-1 ${
                                task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                              }`}
                            >
                              {task.title}
                            </h5>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-medium">
                              {task.requiredSkill}
                            </span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {task.estimatedHours}h
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            {member ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: member.color }}
                                />
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                  {member.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Unassigned</span>
                            )}

                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleUpdateStatus(task.id, e.target.value as TaskStatus)
                              }
                              className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done ✅</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToReview}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Modify Tasks / Reassign</span>
        </button>
      </div>
    </div>
  );
};
