import { TeamMember, TaskItem, FairnessAnalysis } from '../types';

export const MEMBER_PALETTE = [
  { name: 'Coral', hex: '#F43F5E', bgLight: '#FFE4E6', border: '#FDA4AF', text: '#BE123C' },
  { name: 'Sky Blue', hex: '#0284C7', bgLight: '#E0F2FE', border: '#7DD3FC', text: '#0369A1' },
  { name: 'Amber', hex: '#F59E0B', bgLight: '#FEF3C7', border: '#FCD34D', text: '#B45309' },
  { name: 'Emerald', hex: '#10B981', bgLight: '#D1FAE5', border: '#6EE7B7', text: '#047857' },
  { name: 'Violet', hex: '#8B5CF6', bgLight: '#EDE9FE', border: '#C4B5FD', text: '#6D28D9' },
  { name: 'Pink', hex: '#EC4899', bgLight: '#FCE7F3', border: '#F472B6', text: '#BE185D' },
  { name: 'Teal', hex: '#0D9488', bgLight: '#CCFBF1', border: '#5EEAD4', text: '#0F766E' },
  { name: 'Indigo', hex: '#4F46E5', bgLight: '#E0E7FF', border: '#A5B4FC', text: '#4338CA' },
];

export const DEFAULT_SKILL_SUGGESTIONS = [
  'Frontend',
  'Backend',
  'ML',
  'Design',
  'Writing',
  'Testing',
  'Presentation',
  'DevOps',
  'Research',
  'Data Analysis',
];

/**
 * Calculates the Fairness Score and workload metrics for the team.
 * Score is based on standard deviation and spread of each member's load ratio (assigned hours / available hours).
 */
export function calculateFairness(members: TeamMember[], tasks: TaskItem[]): FairnessAnalysis {
  if (members.length === 0) {
    return {
      score: 100,
      label: 'Balanced',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      mostLoaded: null,
      leastLoaded: null,
      memberLoads: [],
      totalAssignedHours: 0,
      totalAvailableHours: 0,
      stdDev: 0,
      meanRatio: 0,
    };
  }

  // Calculate assigned hours per member
  const memberHoursMap: Record<string, { hours: number; count: number }> = {};
  members.forEach((m) => {
    memberHoursMap[m.id] = { hours: 0, count: 0 };
  });

  let totalAssignedHours = 0;
  tasks.forEach((t) => {
    if (t.assignedTo && memberHoursMap[t.assignedTo]) {
      memberHoursMap[t.assignedTo].hours += Number(t.estimatedHours) || 0;
      memberHoursMap[t.assignedTo].count += 1;
      totalAssignedHours += Number(t.estimatedHours) || 0;
    }
  });

  const totalAvailableHours = members.reduce(
    (acc, m) => acc + (Number(m.availableHoursPerWeek) || 1),
    0
  );

  const memberLoads = members.map((member) => {
    const data = memberHoursMap[member.id] || { hours: 0, count: 0 };
    const available = Math.max(1, Number(member.availableHoursPerWeek) || 1);
    const loadRatio = data.hours / available;
    const percentageOfTotal =
      totalAssignedHours > 0 ? (data.hours / totalAssignedHours) * 100 : 0;

    return {
      member,
      assignedHours: Number(data.hours.toFixed(1)),
      availableHours: available,
      loadRatio,
      percentageOfTotal: Number(percentageOfTotal.toFixed(1)),
      tasksCount: data.count,
    };
  });

  if (totalAssignedHours === 0) {
    return {
      score: 100,
      label: 'Balanced',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      mostLoaded: null,
      leastLoaded: null,
      memberLoads,
      totalAssignedHours: 0,
      totalAvailableHours,
      stdDev: 0,
      meanRatio: 0,
    };
  }

  // Calculate Mean and Standard Deviation of Load Ratios
  const ratios = memberLoads.map((ml) => ml.loadRatio);
  const meanRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const variance =
    ratios.reduce((acc, r) => acc + Math.pow(r - meanRatio, 2), 0) / ratios.length;
  const stdDev = Math.sqrt(variance);

  const minRatio = Math.min(...ratios);
  const maxRatio = Math.max(...ratios);
  const spread = maxRatio - minRatio;

  // Fairness formula: 100 - scaled measure of ratio divergence
  // When ratios are uniform (e.g. all 0.5), stdDev = 0, spread = 0 -> Score 100.
  const penalty = stdDev * 55 + spread * 18;
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let label: 'Balanced' | 'Slightly uneven' | 'Uneven' = 'Balanced';
  let labelColor = 'text-emerald-600 dark:text-emerald-400';

  if (score < 70) {
    label = 'Uneven';
    labelColor = 'text-rose-600 dark:text-rose-400';
  } else if (score < 85) {
    label = 'Slightly uneven';
    labelColor = 'text-amber-600 dark:text-amber-400';
  }

  // Find most and least loaded member
  let mostLoaded: { member: TeamMember; ratio: number; hours: number } | null = null;
  let leastLoaded: { member: TeamMember; ratio: number; hours: number } | null = null;

  const sortedByRatio = [...memberLoads].sort((a, b) => b.loadRatio - a.loadRatio);
  if (sortedByRatio.length > 0) {
    const highest = sortedByRatio[0];
    const lowest = sortedByRatio[sortedByRatio.length - 1];
    mostLoaded = {
      member: highest.member,
      ratio: Number(highest.loadRatio.toFixed(2)),
      hours: highest.assignedHours,
    };
    leastLoaded = {
      member: lowest.member,
      ratio: Number(lowest.loadRatio.toFixed(2)),
      hours: lowest.assignedHours,
    };
  }

  return {
    score,
    label,
    labelColor,
    mostLoaded,
    leastLoaded,
    memberLoads,
    totalAssignedHours: Number(totalAssignedHours.toFixed(1)),
    totalAvailableHours,
    stdDev: Number(stdDev.toFixed(3)),
    meanRatio: Number(meanRatio.toFixed(3)),
  };
}

/**
 * Deterministic Greedy + Exchange balancing algorithm.
 * Guarantees:
 * 1. Skill fit: Members with matching required skills (rated 1-5) are preferred.
 * 2. Workload balance: Workload in hours is balanced proportionally to available hours.
 * 3. Deadline priority: Earlier tasks are prioritized to avoid bottlenecking.
 * 4. Human-readable rationale for each assignment.
 */
export function suggestFairSplit(members: TeamMember[], tasks: TaskItem[]): TaskItem[] {
  if (members.length === 0 || tasks.length === 0) return tasks;

  // Track assigned hours per member during the simulation
  const hoursAssigned: Record<string, number> = {};
  members.forEach((m) => {
    hoursAssigned[m.id] = 0;
  });

  // Sort tasks:
  // 1. Earlier deadlines first
  // 2. Larger tasks first (first-fit decreasing bin packing principle)
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    if (dateA !== dateB) return dateA - dateB;
    return (Number(b.estimatedHours) || 0) - (Number(a.estimatedHours) || 0);
  });

  // Helper to look up member skill rating
  const getSkillRating = (member: TeamMember, skillName: string): number => {
    if (!skillName) return 2.5;
    const match = member.skills.find(
      (s) => s.skill.toLowerCase().trim() === skillName.toLowerCase().trim()
    );
    return match ? match.level : 1;
  };

  const assignedTasks: TaskItem[] = [];

  for (const task of sortedTasks) {
    const taskHours = Number(task.estimatedHours) || 2;
    let bestMember: TeamMember = members[0];
    let bestScore = Infinity;
    let bestSkillLevel = 1;

    for (const member of members) {
      const currentHours = hoursAssigned[member.id] || 0;
      const available = Math.max(1, Number(member.availableHoursPerWeek) || 1);
      const projectedHours = currentHours + taskHours;
      const projectedRatio = projectedHours / available;

      const skillLevel = getSkillRating(member, task.requiredSkill);

      // Cost function
      const capacityOverload = projectedRatio > 1.0 ? (projectedRatio - 1.0) * 2.5 : 0;
      const skillBonus = (skillLevel - 1) * 0.22;
      const cost = projectedRatio * 1.6 + capacityOverload - skillBonus;

      if (cost < bestScore) {
        bestScore = cost;
        bestMember = member;
        bestSkillLevel = skillLevel;
      }
    }

    // Assign to best member
    hoursAssigned[bestMember.id] = (hoursAssigned[bestMember.id] || 0) + taskHours;

    const remainingCap = Math.max(
      0,
      Number(
        ((Number(bestMember.availableHoursPerWeek) || 1) - hoursAssigned[bestMember.id]).toFixed(1)
      )
    );

    const reason = `Assigned to ${bestMember.name}: skill ${bestSkillLevel}/5 in ${
      task.requiredSkill || 'General'
    }, ${remainingCap}h free capacity this week`;

    assignedTasks.push({
      ...task,
      assignedTo: bestMember.id,
      assignmentReason: reason,
    });
  }

  // Local Exchange Optimization
  let improved = true;
  let iterations = 0;

  while (improved && iterations < 10) {
    improved = false;
    iterations++;

    let maxRatio = -1;
    let minRatio = Infinity;
    let maxMemberId = '';
    let minMemberId = '';

    members.forEach((m) => {
      const avail = Math.max(1, Number(m.availableHoursPerWeek) || 1);
      const ratio = (hoursAssigned[m.id] || 0) / avail;
      if (ratio > maxRatio) {
        maxRatio = ratio;
        maxMemberId = m.id;
      }
      if (ratio < minRatio) {
        minRatio = ratio;
        minMemberId = m.id;
      }
    });

    if (maxRatio - minRatio <= 0.15) {
      break;
    }

    const candidateTasks = assignedTasks.filter((t) => t.assignedTo === maxMemberId);
    for (const t of candidateTasks) {
      const tHours = Number(t.estimatedHours) || 2;
      const targetMember = members.find((m) => m.id === minMemberId);
      if (!targetMember) continue;

      const targetSkill = getSkillRating(targetMember, t.requiredSkill);
      if (targetSkill >= 2) {
        const maxAvail = Math.max(1, members.find((m) => m.id === maxMemberId)!.availableHoursPerWeek);
        const minAvail = Math.max(1, targetMember.availableHoursPerWeek);

        const newMaxRatio = (hoursAssigned[maxMemberId] - tHours) / maxAvail;
        const newMinRatio = (hoursAssigned[minMemberId] + tHours) / minAvail;

        if (Math.abs(newMaxRatio - newMinRatio) < maxRatio - minRatio) {
          hoursAssigned[maxMemberId] -= tHours;
          hoursAssigned[minMemberId] += tHours;
          t.assignedTo = minMemberId;
          const remaining = Math.max(0, minAvail - hoursAssigned[minMemberId]).toFixed(1);
          t.assignmentReason = `Balanced to ${targetMember.name}: skill ${targetSkill}/5 in ${
            t.requiredSkill
          }, ${remaining}h capacity remaining`;
          improved = true;
          break;
        }
      }
    }
  }

  const idMap = new Map(assignedTasks.map((t) => [t.id, t]));
  return tasks.map((t) => idMap.get(t.id) || t);
}
