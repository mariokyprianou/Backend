export interface ExerciseNote {
  exercise: string;
  note: string;
}

export interface WorkoutOrder {
  id: string;
  index: number;
}

export interface WorkoutSetWeightInput {
  exerciseId: string;
  weight: number;
  setNumber: number;
  setType: SetType;
  quantity: number;
  date: Date;
}

export interface CompleteWorkoutInput {
  workoutId: string;
  date: Date;
  intensity: number;
  emoji: string;
  timeTaken: number;
  weightsUsed: WorkoutSetWeightInput[];
}

export interface ExerciseWeight {
  id: string;
  exerciseId: string;
  weight: number;
  /** @deprecated */
  reps: number;
  setNumber: number;
  setType: SetType;
  quantity: number;
  createdAt?: Date;
}

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
  GYM = 'GYM',
  HOME = 'HOME',
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
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface ShareMediaLocalisation {
  imageKey: string;
  colour: string;
}

export enum IntensityEnum {
  LOW = 'LOW',
  MOD = 'MOD',
  HIGH = 'HIGH',
}

export enum SetType {
  REPS = 'REPS',
  TIME = 'TIME',
}

export interface IProgrammeWorkout {
  duration: number;
  exercises: WorkoutExercise[];
  intensity: IntensityEnum;
  isContinuous: boolean;
  localisations: ProgrammeWorkoutLocalisations[];
  orderIndex: number;
  overviewImageKey?: string;
  programme: string;
  weekNumber: number;
}

export interface ProgrammeWorkoutLocalisations {
  language: string;
  name: string;
}

export interface WorkoutExercise {
  orderIndex: number;
  setType: SetType;
  sets: WorkoutSet[];
  exercise: string;
  localisations: WorkoutExerciseLocalisation[];
}

export interface WorkoutExerciseLocalisation {
  language: string;
  coachingTips: string;
}

export interface WorkoutSet {
  setNumber: number;
  quantity: number;
  restTime: number;
}

export interface HmcQuestionLocalisationGraphQlType {
  language: string;
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export interface RegisterUserInput {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  gender: Gender;
  dateOfBirth: Date;
  country: string;
  region: string;
  deviceUDID: string;
  timeZone: string;
  programme: string;
}

export enum downloadQuality {
  LOW,
  HIGH,
}

export interface AuthContext {
  id?: string;
  sub: string;
}

export interface UserProfile {
  givenName: string;
  familyName: string;
  email: string;
  gender?: string;
  dateOfBirth?: Date;
  country?: string;
  region?: string;
  deviceUDID: string;
  timeZone: string;
  canChangeDevice: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface UserProfileInput {
  givenName: string;
  familyName: string;
  gender?: string;
  dateOfBirth?: Date;
  country?: string;
  region?: string;
  timeZone: string;
}

export interface UserPreference {
  notifications: boolean;
  emails: boolean;
  errorReports: boolean;
  analytics: boolean;
  downloadQuality: DownloadQuality;
  weightPreference: WeightPreference;
}

export enum WeightPreference {
  KG,
  LB,
}

export enum DownloadQuality {
  HIGH = 'HIGH',
  LOW = 'LOW',
}

export interface ChangeDevice {
  deviceId: string;
}

// export interface UserProgramme {
//   id: string;
//   trainer:
// }
