export interface ProgrammeSchedule {
  weeks: ProgrammeWeekSummary[];
}

export interface ProgrammeWeekSummary {
  weekNumber: number;
  workouts: ProgrammeWorkoutSummary[];
  startedAt?: Date;
}

export interface ProgrammeWorkoutSummary {
  name: string;
  orderIndex: number;
  duration: number;
  completedAt?: Date;
}
