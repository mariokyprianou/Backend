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

export enum ProgrammeEnvironment {
  GYM,
  HOME,
}

export interface IProgramme {
  trainerId: string;
  fatLoss: number;
  fitness: number;
  muscle: number;
  environment: ProgrammeEnvironment;
  status: PublishStatus;
  images: ProgrammeImages[];
  localisations: ProgrammeLocalisation[];
}

export interface ProgrammeLocalisation {
  language: string;
  description: string;
}

export interface ProgrammeImages {
  imageKey: string;
  orderIndex: number;
}

export enum PublishStatus {
  DRAFT,
  PUBLISHED,
}

export interface IShareMedia {
  type: ShareMediaType;
  localisations: ShareMediaLocalisations[];
}

export interface ShareMediaLocalisations {
  imageKey: string;
  colour: string;
}

export enum ShareMediaType {
  PROGRAMME_START,
  WEEK_COMPLETE,
  CHALLENGE_COMPLETE,
  PROGRESS,
}
