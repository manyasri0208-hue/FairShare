export interface SkillRating {
  skill: string;
  level: number; // 1 to 5
}

export interface TeamMember {
  id: string;
  name: string;
  color: string; // Hex color code
  skills: SkillRating[];
  availableHoursPerWeek: number;
}

export type TaskComplexity = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  requiredSkill: string;
  deadline: string; // YYYY-MM-DD
  complexity: TaskComplexity;
  estimatedHours: number;
  assignedTo: string | null; // TeamMember id
  status: TaskStatus;
  assignmentReason?: string;
}

export interface ProjectState {
  name: string;
  deadline: string; // YYYY-MM-DD
  members: TeamMember[];
  tasks: TaskItem[];
  currentStep: number; // 1 to 5
  approvedMemberIds: string[];
  isLocked: boolean;
}

export interface FairnessAnalysis {
  score: number; // 0 - 100
  label: 'Balanced' | 'Slightly uneven' | 'Uneven';
  labelColor: string;
  mostLoaded: { member: TeamMember; ratio: number; hours: number } | null;
  leastLoaded: { member: TeamMember; ratio: number; hours: number } | null;
  memberLoads: {
    member: TeamMember;
    assignedHours: number;
    availableHours: number;
    loadRatio: number; // assigned / available
    percentageOfTotal: number;
    tasksCount: number;
  }[];
  totalAssignedHours: number;
  totalAvailableHours: number;
  stdDev: number;
  meanRatio: number;
}
