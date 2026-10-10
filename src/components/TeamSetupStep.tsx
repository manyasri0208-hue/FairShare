import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Calendar,
  Star,
  Clock,
  ArrowRight,
  Palette,
  Check,
  AlertCircle,
} from 'lucide-react';
import { TeamMember, SkillRating } from '../types';
import { MEMBER_PALETTE, DEFAULT_SKILL_SUGGESTIONS } from '../utils/fairness';

interface TeamSetupStepProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  deadline: string;
  onUpdateDeadline: (deadline: string) => void;
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
  onNext: () => void;
}

export const TeamSetupStep: React.FC<TeamSetupStepProps> = ({
  projectName,
  onUpdateProjectName,
  deadline,
  onUpdateDeadline,
  members,
  onUpdateMembers,
  onNext,
}) => {
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddMember = () => {
    if (members.length >= 6) {
      setErrorMessage('Student teams are capped at 6 members for optimal fairness.');
      return;
    }
    setErrorMessage(null);
    const assignedPalette = MEMBER_PALETTE[members.length % MEMBER_PALETTE.length];
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: `Member ${members.length + 1}`,
      color: assignedPalette.hex,
      availableHoursPerWeek: 10,
      skills: [
        { skill: 'Writing', level: 4 },
        { skill: 'Presentation', level: 3 },
      ],
    };
    onUpdateMembers([...members, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 2) {
      setErrorMessage('A team project requires at least 2 members to distribute tasks.');
      return;
    }
    setErrorMessage(null);
    onUpdateMembers(members.filter((m) => m.id !== id));
  };

  const handleUpdateMemberField = (id: string, updates: Partial<TeamMember>) => {
    onUpdateMembers(members.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSetSkillLevel = (memberId: string, skillName: string, level: number) => {
    onUpdateMembers(
      members.map((m) => {
        if (m.id !== memberId) return m;
        const existing = m.skills.find((s) => s.skill.toLowerCase() === skillName.toLowerCase());
        let updatedSkills: SkillRating[];
        if (existing) {
          updatedSkills = m.skills.map((s) =>
            s.skill.toLowerCase() === skillName.toLowerCase() ? { ...s, level } : s
          );
        } else {
          updatedSkills = [...m.skills, { skill: skillName, level }];
        }
        return { ...m, skills: updatedSkills };
      })
    );
  };

  const handleRemoveSkill = (memberId: string, skillName: string) => {
    onUpdateMembers(
      members.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          skills: m.skills.filter((s) => s.skill.toLowerCase() !== skillName.toLowerCase()),
        };
      })
    );
  };

  const handleAddCustomSkill = (memberId: string) => {
    const raw = (newSkillInputs[memberId] || '').trim();
    if (!raw) return;
    handleSetSkillLevel(memberId, raw, 3);
    setNewSkillInputs((prev) => ({ ...prev, [memberId]: '' }));
  };

  const handleProceed = () => {
    if (members.length < 2) {
      setErrorMessage('Please add at least 2 team members.');
      return;
    }
    const hasEmptyName = members.some((m) => !m.name.trim());
    if (hasEmptyName) {
      setErrorMessage('All members must have a name.');
      return;
    }
    setErrorMessage(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            1. Team Setup & Capacity
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure your project deadline and each student&apos;s available hours per week and skill proficiencies (1 to 5).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => onUpdateProjectName(e.target.value)}
              placeholder="e.g. CS410 Final Group Project"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Final Submission Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => onUpdateDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Team Members ({members.length} / 6)
          </h3>
          {members.length < 6 && (
            <button
              type="button"
              onClick={handleAddMember}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Member
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {members.map((member, index) => {
            const initials = member.name
              ? member.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : `M${index + 1}`;

            return (
              <div
                key={member.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                      style={{ backgroundColor: member.color }}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateMemberField(member.id, { name: e.target.value })}
                        placeholder="Member Name"
                        className="w-full font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none py-0.5"
                      />
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        Student #{index + 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveColorPicker(activeColorPicker === member.id ? null : member.id)
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Change member color"
                    >
                      <Palette className="w-4 h-4" />
                    </button>

                    {members.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {activeColorPicker === member.id && (
                  <div className="p-3 mb-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Choose member color:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MEMBER_PALETTE.map((pal) => (
                        <button
                          key={pal.hex}
                          type="button"
                          onClick={() => {
                            handleUpdateMemberField(member.id, { color: pal.hex });
                            setActiveColorPicker(null);
                          }}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-2xs"
                          style={{ backgroundColor: pal.hex }}
                          title={pal.name}
                        >
                          {member.color === pal.hex && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      Available Hours / Week
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={member.availableHoursPerWeek}
                        onChange={(e) =>
                          handleUpdateMemberField(member.id, {
                            availableHoursPerWeek: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-16 px-2 py-1 text-right text-xs font-bold font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">hrs</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Skills & Proficiency (1-5)
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      Used for smart matching
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    {member.skills.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                        No skills tagged yet. Pick from below or type custom.
                      </p>
                    ) : (
                      member.skills.map((s) => (
                        <div
                          key={s.skill}
                          className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-100 dark:border-slate-800"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {s.skill}
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((lvl) => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSetSkillLevel(member.id, s.skill, lvl)}
                                  className={`p-0.5 transition-colors ${
                                    lvl <= s.level
                                      ? 'text-amber-500 hover:text-amber-600'
                                      : 'text-slate-200 dark:text-slate-700 hover:text-slate-400'
                                  }`}
                                  title={`Set level ${lvl}`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      lvl <= s.level ? 'fill-amber-400' : ''
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 w-4 text-center">
                              {s.level}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(member.id, s.skill)}
                              className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 p-0.5"
                              title="Remove skill"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {DEFAULT_SKILL_SUGGESTIONS.filter(
                      (s) => !member.skills.some((ms) => ms.skill.toLowerCase() === s.toLowerCase())
                    )
                      .slice(0, 5)
                      .map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSetSkillLevel(member.id, suggestion, 3)}
                          className="px-2 py-0.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkillInputs[member.id] || ''}
                      onChange={(e) =>
                        setNewSkillInputs((prev) => ({ ...prev, [member.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill(member.id);
                        }
                      }}
                      placeholder="Add custom skill..."
                      className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCustomSkill(member.id)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleProceed}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:gap-3"
        >
          <span>Next: Configure Tasks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
