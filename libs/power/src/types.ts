export interface TrainerLocalisation {
  language: string;
  name: string;
}

export interface ExerciseLocalisation {
  language: string;
  name: string;
  coachingTips: string;
}

export interface IExercise {
  weight: boolean;
  trainerId?: string;
  videoKey: string;
  videoKeyEasy: string;
  videoKeyEasiest: string;
  categoryId: string;
}

export interface Filter {
  id?: string;
  ids?: string[];
}

export interface ListMetadata {
  count: number;
}
