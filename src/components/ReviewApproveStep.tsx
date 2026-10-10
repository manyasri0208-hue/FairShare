import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Scale,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem, TeamMember } from '../types';
import { calculateFairness } from '../utils/fairness';
import { FairnessGauge } from './FairnessGauge';
import { WorkloadCharts } from './WorkloadCharts';

interface ReviewApproveStepProps {
  tasks: TaskItem[];
  members: TeamMember[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  approvedMemberIds: string[];
  onToggleMemberApproval: (memberId: string) => void;
  onApproveAll: () => void;
  isLocked: boolean;
  onLockPlan: () => void;
  onNext: () => void;
  onBack: () => void;
  onOpenFormula: () => void;
}

export const ReviewApproveStep: React.FC<ReviewApproveStepProps> = ({
  tasks,
  members,
  onUpdateTasks,
  approvedMemberIds,
  onToggleMemberApproval,
  onApproveAll,
  isLocked,
  onLockPlan,
  onNext,
  onBack,
  onOpenFormula,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverMemberId, setDragOverMemberId] = useState<string | null>(null);
  const [lastMovedNote, setLastMovedNote] = useState<string | null>(null);
  const [openReassignMenuId, setOpenReassignMenuId] = useState<string | null>(null);

  const analysis = calculateFairness(members, tasks);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, memberId: string) => {
    e.preventDefault();
    setDragOverMemberId(memberId);
  };

  const handleDragLeave = () => {
    setDragOverMemberId(null);
  };

  const handleDrop = (e: React.DragEvent, targetMemberId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverMemberId(null);
    setDraggedTaskId(null);

    if (!taskId) return;
    reassignTask(taskId, targetMemberId);
  };

  const reassignTask = (taskId: string, targetMemberId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const targetMember = members.find((m) => m.id === targetMemberId);
    if (!task || !targetMember) return;
    if (task.assignedTo === targetMemberId) return;

    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            assignedTo: targetMemberId,
            assignmentReason: `Manually reassigned to ${targetMember.name}`,
          }
        : t
    );

    onUpdateTasks(updatedTasks);
    setOpenReassignMenuId(null);

    const newAnalysis = calculateFairness(members, updatedTasks);
    setLastMovedNote(
      `Reassigned "${task.title.slice(0, 24)}..." to ${targetMember.name} • New Fairness Score: ${
        newAnalysis.score
      }/100 (${newAnalysis.label})`
    );
  };

  const handleApproveTeamPlan = () => {
    onLockPlan();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
    onNext();
  };

  const allApproved = members.length > 0 && members.every((m) => approvedMemberIds.includes(m.id));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              4. Review & Team Sign-Off
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Drag cards or use the Reassign menu to fine-tune. Watch how the fairness score updates live! Once everyone agrees, check approval boxes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-500" />
              <div className="text-xs">
                <span className="text-slate-400">Score:</span>{' '}
                <span className="font-extrabold font-mono text-slate-800 dark:text-white">
                  {analysis.score}/100
                </span>{' '}
                <span className={`font-semibold ${analysis.labelColor}`}>({analysis.label})</span>
              </div>
            </div>
          </div>
        </div>

        {lastMovedNote && (
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{lastMovedNote}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastMovedNote(null)}
              className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FairnessGauge analysis={analysis} onOpenFormula={onOpenFormula} />
        <WorkloadCharts analysis={analysis} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Member Workload Columns
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Drag cards between members or click Reassign
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const memberAssignedTasks = tasks.filter((t) => t.assignedTo === member.id);
            const totalHours = memberAssignedTasks.reduce(
              (acc, t) => acc + (Number(t.estimatedHours) || 0),
              0
            );
            const availableHours = Math.max(1, member.availableHoursPerWeek);
            const loadRatio = totalHours / availableHours;
            const isDropTarget = dragOverMemberId === member.id;
            const isApproved = approvedMemberIds.includes(member.id);

            return (
              <div
                key={member.id}
                onDragOver={(e) => handleDragOver(e, member.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, member.id)}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                  isDropTarget
                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {member.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {totalHours.toFixed(1)}h / {availableHours}h ({Math.round(loadRatio * 100)}%)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleMemberApproval(member.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors border ${
                        isApproved
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                      title={isApproved ? 'Click to unapprove' : 'Click to approve workload'}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Agreed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-300" />
                          <span>Reviewing</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (totalHours / availableHours) * 100)}%`,
                        backgroundColor: member.color,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 space-y-2.5 flex-1 min-h-[160px]">
                  {memberAssignedTasks.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400 dark:text-slate-500">
                      Drop tasks here
                    </div>
                  ) : (
                    memberAssignedTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="group relative p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-700"
                        style={{ borderLeftWidth: '4px', borderLeftColor: member.color }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug flex-1">
                            {task.title}
                          </h5>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenReassignMenuId(
                                  openReassignMenuId === task.id ? null : task.id
                                );
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Reassign to another member"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {openReassignMenuId === task.id && (
                              <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                                  Reassign to:
                                </div>
                                {members.map((target) => (
                                  <button
                                    key={target.id}
                                    type="button"
                                    onClick={() => reassignTask(task.id, target.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                                      target.id === member.id
                                        ? 'bg-slate-100 dark:bg-slate-700/60 font-semibold text-slate-800 dark:text-white'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                    }`}
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0"
                                      style={{ backgroundColor: target.color }}
                                    />
                                    <span className="truncate">{target.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-medium">
                            {task.requiredSkill}
                          </span>

                          <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                            {task.estimatedHours}h
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 rounded-b-2xl text-[11px] flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>{memberAssignedTasks.length} tasks</span>
                  <span>Cap: {member.availableHoursPerWeek}h/wk</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50/80 to-teal-50/60 dark:from-indigo-950/40 dark:to-teal-950/30 border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Team Agreement Sign-Off
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ensure every member confirms their share before locking. Eliminates WhatsApp disputes!
            </p>

            <div className="flex flex-wrap gap-2.5 mt-3">
              {members.map((m) => {
                const approved = approvedMemberIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onToggleMemberApproval(m.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      approved
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: approved ? '#ffffff' : m.color }}
                    />
                    <span>{m.name}</span>
                    {approved && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!allApproved && (
              <button
                type="button"
                onClick={onApproveAll}
                className="px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/80 text-indigo-600 dark:text-indigo-400 hover:bg-white text-xs font-semibold transition-colors"
              >
                Approve for All
              </button>
            )}

            <button
              type="button"
              onClick={handleApproveTeamPlan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Approve as a Team & Launch</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Suggestion</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:gap-3"
        >
          <span>Go to Project Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
