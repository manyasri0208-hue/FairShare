import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Layers,
} from 'lucide-react';
import { TaskItem, TaskComplexity, TeamMember } from '../types';
import { DEFAULT_SKILL_SUGGESTIONS } from '../utils/fairness';

interface TasksStepProps {
  tasks: TaskItem[];
  members: TeamMember[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onNext: () => void;
  onBack: () => void;
  projectDeadline: string;
}

export const TasksStep: React.FC<TasksStepProps> = ({
  tasks,
  members,
  onUpdateTasks,
  onNext,
  onBack,
  projectDeadline,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('Frontend');
  const [deadline, setDeadline] = useState(projectDeadline || '');
  const [complexity, setComplexity] = useState<TaskComplexity>('Medium');
  const [estimatedHours, setEstimatedHours] = useState(4);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<'ai' | 'heuristic' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const memberSkills = Array.from(
    new Set([
      ...DEFAULT_SKILL_SUGGESTIONS,
      ...members.flatMap((m) => m.skills.map((s) => s.skill)),
    ])
  );

  const openNewTaskForm = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setRequiredSkill(memberSkills[0] || 'Frontend');
    setDeadline(projectDeadline || '');
    setComplexity('Medium');
    setEstimatedHours(4);
    setAiReasoning(null);
    setAiSource(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditTaskForm = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setRequiredSkill(task.requiredSkill);
    setDeadline(task.deadline || '');
    setComplexity(task.complexity);
    setEstimatedHours(task.estimatedHours);
    setAiReasoning(null);
    setAiSource(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEstimateWithAi = async () => {
    if (!title.trim()) {
      setFormError('Please enter a task title first so AI can analyze the scope.');
      return;
    }
    setFormError(null);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/estimate-complexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          requiredSkill,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      setComplexity(data.complexity || 'Medium');
      setEstimatedHours(Number(data.estimatedHours) || 4);
      setAiReasoning(data.reasoning || 'Estimated using task complexity heuristics.');
      setAiSource(data.source || 'ai');
    } catch (err) {
      console.warn('AI call failed, applying client heuristic:', err);
      const lower = `${title} ${description}`.toLowerCase();
      let comp: TaskComplexity = 'Medium';
      let hrs = 4;
      if (lower.includes('research') || lower.includes('readme') || lower.includes('presentation')) {
        comp = 'Low';
        hrs = 2;
      } else if (lower.includes('model') || lower.includes('backend') || lower.includes('auth')) {
        comp = 'High';
        hrs = 8;
      }
      setComplexity(comp);
      setEstimatedHours(hrs);
      setAiReasoning('Estimated locally based on task scope keywords.');
      setAiSource('heuristic');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required.');
      return;
    }

    if (editingTaskId) {
      onUpdateTasks(
        tasks.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                title: title.trim(),
                description: description.trim(),
                requiredSkill,
                deadline,
                complexity,
                estimatedHours: Math.max(0.5, Number(estimatedHours) || 1),
              }
            : t
        )
      );
    } else {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        requiredSkill,
        deadline: deadline || projectDeadline || '',
        complexity,
        estimatedHours: Math.max(0.5, Number(estimatedHours) || 1),
        assignedTo: null,
        status: 'todo',
      };
      onUpdateTasks([...tasks, newTask]);
    }

    setIsFormOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleComplexitySelect = (lvl: TaskComplexity) => {
    setComplexity(lvl);
    if (lvl === 'Low') setEstimatedHours(2);
    else if (lvl === 'Medium') setEstimatedHours(5);
    else if (lvl === 'High') setEstimatedHours(10);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            2. Project Tasks & AI Scoping
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            List all deliverables. Use Gemini AI to objectively estimate complexity and hours so no work is underestimated.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewTaskForm}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingTaskId ? 'Edit Project Task' : 'Add New Task'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build authentication endpoints & JWT token handling"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, acceptance criteria, or tools"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Primary Skill Needed
                  </label>
                  <select
                    value={requiredSkill}
                    onChange={(e) => setRequiredSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {memberSkills.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Task Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Estimate Complexity with AI
                  </span>

                  <button
                    type="button"
                    disabled={isAiLoading}
                    onClick={handleEstimateWithAi}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Estimate with AI</span>
                      </>
                    )}
                  </button>
                </div>

                {aiReasoning && (
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 text-xs text-slate-700 dark:text-slate-300 mb-2">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">
                      {aiSource === 'ai' ? '🤖 Gemini Assessment:' : '💡 Heuristic Assessment:'}{' '}
                    </span>
                    {aiReasoning}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Gemini analyzes undergraduate difficulty and suggests realistic hours. You can edit the result anytime below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Complexity Level
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Low', 'Medium', 'High'] as TaskComplexity[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleComplexitySelect(lvl)}
                        className={`py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                          complexity === lvl
                            ? lvl === 'Low'
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : lvl === 'Medium'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-rose-500 text-white border-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Estimated Hours</span>
                    <span className="text-[10px] text-slate-400 font-normal">Editable</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="40"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Math.max(0.5, Number(e.target.value) || 1))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">hours</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {editingTaskId ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              No tasks added yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              Add the key components of your group project or click &quot;Load Demo Team&quot; in the top bar to inspect realistic tasks.
            </p>
            <button
              type="button"
              onClick={openNewTaskForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tasks.map((task) => {
              const assignedMember = members.find((m) => m.id === task.assignedTo);

              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                          {task.requiredSkill}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            task.complexity === 'Low'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : task.complexity === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {task.complexity}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTaskForm(task)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-mono font-medium text-slate-700 dark:text-slate-200">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {task.estimatedHours}h
                      </span>

                      {task.deadline && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {task.deadline}
                        </span>
                      )}
                    </div>

                    {assignedMember ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: assignedMember.color }}
                        />
                        <span className="text-slate-700 dark:text-slate-200 truncate max-w-[90px]">
                          {assignedMember.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        Unassigned
                      </span>
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
          <span>Back to Team Setup</span>
        </button>

        <button
          type="button"
          disabled={tasks.length === 0}
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:gap-3"
        >
          <span>Next: Suggest Fair Split</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
