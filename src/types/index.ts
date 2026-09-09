export type TaskDTO = {
  id: string;
  title: string;
  done: boolean;
  order: number;
};

export type MilestoneDTO = {
  id: string;
  title: string;
  order: number;
  tasks: TaskDTO[];
};

export type GoalDTO = {
  id: string;
  title: string;
  objective: string | null;
  strategy: string[];
  milestones: MilestoneDTO[];
  progressPercent: number; // derived: done tasks / total tasks
};

export type CareerSnapshotDTO = {
  targetCareer: string;
  careerReadiness: number;
  skills: { name: string; proficiency: number }[];
};

export type LearningSnapshotDTO = {
  lessonId: string;
  lessonTitle: string;
  subject: string;
  percentComplete: number;
};

export type OpportunityDTO = {
  id: string;
  title: string;
  org: string;
  type: string;
  deadline: string | null;
  location: string | null;
  eligibility: string | null;
  description: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
  saved: boolean;
};

// The scoped context object the AI orchestration layer builds per request.
// This is intentionally NOT the whole user record — see lib/ai/context-builder.ts.
export type AIContext = {
  userName: string;
  career?: CareerSnapshotDTO;
  learning?: LearningSnapshotDTO;
  goal?: GoalDTO;
  interests: string[];
};

export type AIActionType =
  | "openLesson"
  | "openCareer"
  | "openGoals"
  | "openOpportunities"
  | "completeTask"
  | null;
