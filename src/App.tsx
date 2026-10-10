import React, { useState, useEffect } from 'react';
import { ProjectState, TeamMember, TaskItem } from './types';
import { getDemoProjectData } from './utils/demoData';
import { calculateFairness, suggestFairSplit } from './utils/fairness';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { TeamSetupStep } from './components/TeamSetupStep';
import { TasksStep } from './components/TasksStep';
import { SuggestionStep } from './components/SuggestionStep';
import { ReviewApproveStep } from './components/ReviewApproveStep';
import { DashboardStep } from './components/DashboardStep';
import { FormulaModal } from './components/FormulaModal';

const STORAGE_KEY = 'fairshare_project_v1';
const THEME_KEY = 'fairshare_theme_v1';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const [project, setProject] = useState<ProjectState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to parse saved project state:', e);
      }
    }

    const demo = getDemoProjectData();
    const balancedTasks = suggestFairSplit(demo.members, demo.tasks);

    return {
      name: demo.name,
      deadline: demo.deadline,
      members: demo.members,
      tasks: balancedTasks,
      currentStep: 1,
      approvedMemberIds: [demo.members[0].id, demo.members[1].id],
      isLocked: false,
    };
  });

  const [isFormulaOpen, setIsFormulaOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to persist project state:', e);
    }
  }, [project]);

  const handleLoadDemo = () => {
    const demo = getDemoProjectData();
    const balancedTasks = suggestFairSplit(demo.members, demo.tasks);
    setProject({
      name: demo.name,
      deadline: demo.deadline,
      members: demo.members,
      tasks: balancedTasks,
      currentStep: 3,
      approvedMemberIds: [demo.members[0].id, demo.members[1].id, demo.members[2].id],
      isLocked: false,
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset this project and start with a blank team?')) {
      const today = new Date();
      today.setDate(today.getDate() + 14);
      setProject({
        name: 'New Group Project',
        deadline: today.toISOString().split('T')[0],
        members: [
          {
            id: 'member-1',
            name: 'Student 1',
            color: '#F43F5E',
            availableHoursPerWeek: 12,
            skills: [
              { skill: 'Frontend', level: 4 },
              { skill: 'Design', level: 3 },
            ],
          },
          {
            id: 'member-2',
            name: 'Student 2',
            color: '#0284C7',
            availableHoursPerWeek: 12,
            skills: [
              { skill: 'Backend', level: 4 },
              { skill: 'Testing', level: 3 },
            ],
          },
        ],
        tasks: [],
        currentStep: 1,
        approvedMemberIds: [],
        isLocked: false,
      });
    }
  };

  const setStep = (step: number) => {
    setProject((prev) => ({ ...prev, currentStep: step }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProjectName = (name: string) => {
    setProject((prev) => ({ ...prev, name }));
  };

  const updateDeadline = (deadline: string) => {
    setProject((prev) => ({ ...prev, deadline }));
  };

  const updateMembers = (members: TeamMember[]) => {
    setProject((prev) => ({ ...prev, members }));
  };

  const updateTasks = (tasks: TaskItem[]) => {
    setProject((prev) => ({ ...prev, tasks }));
  };

  const toggleMemberApproval = (memberId: string) => {
    setProject((prev) => {
      const exists = prev.approvedMemberIds.includes(memberId);
      const updated = exists
        ? prev.approvedMemberIds.filter((id) => id !== memberId)
        : [...prev.approvedMemberIds, memberId];
      return { ...prev, approvedMemberIds: updated };
    });
  };

  const approveAllMembers = () => {
    setProject((prev) => ({
      ...prev,
      approvedMemberIds: prev.members.map((m) => m.id),
    }));
  };

  const lockPlan = () => {
    setProject((prev) => ({
      ...prev,
      isLocked: true,
      approvedMemberIds: prev.members.map((m) => m.id),
    }));
  };

  const currentAnalysis = calculateFairness(project.members, project.tasks);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        project={project}
        analysis={currentAnalysis}
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <Stepper
        currentStep={project.currentStep}
        onStepChange={setStep}
        isApproved={project.isLocked}
        tasksCount={project.tasks.length}
        membersCount={project.members.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {project.currentStep === 1 && (
          <TeamSetupStep
            projectName={project.name}
            onUpdateProjectName={updateProjectName}
            deadline={project.deadline}
            onUpdateDeadline={updateDeadline}
            members={project.members}
            onUpdateMembers={updateMembers}
            onNext={() => setStep(2)}
          />
        )}

        {project.currentStep === 2 && (
          <TasksStep
            tasks={project.tasks}
            members={project.members}
            onUpdateTasks={updateTasks}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            projectDeadline={project.deadline}
          />
        )}

        {project.currentStep === 3 && (
          <SuggestionStep
            tasks={project.tasks}
            members={project.members}
            onApplySplit={(balanced) => updateTasks(balanced)}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            onOpenFormula={() => setIsFormulaOpen(true)}
          />
        )}

        {project.currentStep === 4 && (
          <ReviewApproveStep
            tasks={project.tasks}
            members={project.members}
            onUpdateTasks={updateTasks}
            approvedMemberIds={project.approvedMemberIds}
            onToggleMemberApproval={toggleMemberApproval}
            onApproveAll={approveAllMembers}
            isLocked={project.isLocked}
            onLockPlan={lockPlan}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
            onOpenFormula={() => setIsFormulaOpen(true)}
          />
        )}

        {project.currentStep === 5 && (
          <DashboardStep
            tasks={project.tasks}
            members={project.members}
            onUpdateTasks={updateTasks}
            projectName={project.name}
            projectDeadline={project.deadline}
            onBackToReview={() => setStep(4)}
            onOpenFormula={() => setIsFormulaOpen(true)}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FairShare — Transparent Workload Balancing for University & College Teams</span>
          <span>Zero WhatsApp Arguments • Proportional Bandwidth Split</span>
        </div>
      </footer>

      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
        analysis={currentAnalysis}
      />
    </div>
  );
}

export default App;
