import { TeamMember, TaskItem } from '../types';

export function getDemoProjectData() {
  const today = new Date();
  const formatOffsetDate = (daysAhead: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const demoMembers: TeamMember[] = [
    {
      id: 'member-disha',
      name: 'Disha Patel',
      color: '#F43F5E', // Coral
      availableHoursPerWeek: 14,
      skills: [
        { skill: 'ML', level: 5 },
        { skill: 'Backend', level: 4 },
        { skill: 'Research', level: 4 },
        { skill: 'Data Analysis', level: 5 },
      ],
    },
    {
      id: 'member-alex',
      name: 'Alex Chen',
      color: '#0284C7', // Sky Blue
      availableHoursPerWeek: 12,
      skills: [
        { skill: 'Frontend', level: 5 },
        { skill: 'Design', level: 4 },
        { skill: 'Presentation', level: 4 },
        { skill: 'Testing', level: 3 },
      ],
    },
    {
      id: 'member-marcus',
      name: 'Marcus Vance',
      color: '#F59E0B', // Amber
      availableHoursPerWeek: 10,
      skills: [
        { skill: 'Backend', level: 5 },
        { skill: 'DevOps', level: 4 },
        { skill: 'Writing', level: 4 },
        { skill: 'Testing', level: 4 },
      ],
    },
  ];

  const demoTasks: TaskItem[] = [
    {
      id: 'task-1',
      title: 'Train carbon emission regression model',
      description: 'Implement scikit-learn pipeline using campus utility & commuter transit datasets.',
      requiredSkill: 'ML',
      deadline: formatOffsetDate(5),
      complexity: 'High',
      estimatedHours: 9,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-2',
      title: 'Design responsive UI wireframes & interactive prototypes',
      description: 'Create mobile-friendly student dashboard in Figma and design design system tokens.',
      requiredSkill: 'Design',
      deadline: formatOffsetDate(3),
      complexity: 'Medium',
      estimatedHours: 4,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-3',
      title: 'Develop REST API endpoints for carbon activity logging',
      description: 'Build Express / FastAPI routes with JWT authentication and PostgreSQL schema.',
      requiredSkill: 'Backend',
      deadline: formatOffsetDate(4),
      complexity: 'Medium',
      estimatedHours: 6,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-4',
      title: 'Build interactive weekly breakdown chart components',
      description: 'Implement interactive SVG data charts with real-time category filtering.',
      requiredSkill: 'Frontend',
      deadline: formatOffsetDate(6),
      complexity: 'Medium',
      estimatedHours: 5,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-5',
      title: 'Set up Docker compose & CI/CD deployment pipeline',
      description: 'Containerize frontend, backend, and PostgreSQL database with GitHub Actions workflow.',
      requiredSkill: 'DevOps',
      deadline: formatOffsetDate(2),
      complexity: 'Low',
      estimatedHours: 3,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-6',
      title: 'Author project report methodology & literature review',
      description: 'Synthesize research sources, formulate evaluation metrics, and write section 3.',
      requiredSkill: 'Writing',
      deadline: formatOffsetDate(7),
      complexity: 'Medium',
      estimatedHours: 4,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-7',
      title: 'Automated end-to-end integration and API unit tests',
      description: 'Write Jest and PyTest suites testing carbon calculation edge cases.',
      requiredSkill: 'Testing',
      deadline: formatOffsetDate(6),
      complexity: 'Low',
      estimatedHours: 3,
      assignedTo: null,
      status: 'todo',
    },
    {
      id: 'task-8',
      title: 'Prepare final 8-minute presentation slide deck & demo script',
      description: 'Outline key takeaways, problem statement, architecture slide, and live demo cues.',
      requiredSkill: 'Presentation',
      deadline: formatOffsetDate(8),
      complexity: 'Low',
      estimatedHours: 2,
      assignedTo: null,
      status: 'todo',
    },
  ];

  return {
    name: 'EcoTrack — Campus Carbon Tracker',
    deadline: formatOffsetDate(9),
    members: demoMembers,
    tasks: demoTasks,
  };
}
