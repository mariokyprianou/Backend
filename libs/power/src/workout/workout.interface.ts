export interface IWorkout {
  duration: number;
  exercises: IWorkoutExercise[];
  intensity: WorkoutIntensity;
  isContinuous: boolean;
  localisations: IWorkoutLocalisation[];
  orderIndex: number;
  overviewImageKey?: string;
  programme: string;
  tagIds?: string[];
}

export interface IWorkoutLocalisation {
  language: string;
  name: string;
}

export interface IWorkoutExercise {
  orderIndex: number;
  setType: SetType;
  sets: IWorkoutSet[];
  exercise: string;
  localisations: IWorkoutExerciseLocalisation[];
}

export interface IWorkoutExerciseLocalisation {
  language: string;
  coachingTips?: string;
}

export interface IWorkoutSet {
  setNumber: number;
  quantity: number;
  restTime: number;
}

export enum WorkoutIntensity {
  LOW = 'LOW',
  MOD = 'MOD',
  HIGH = 'HIGH',
}

export enum SetType {
  REPS = 'REPS',
  TIME = 'TIME',
}

export enum WorkoutType {
  SCHEDULED = 'SCHEDULED',
  ON_DEMAND = 'ON_DEMAND',
}
