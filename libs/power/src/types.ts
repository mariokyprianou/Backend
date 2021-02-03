export interface ExerciseNote {
  exercise: string;
  note: string;
}

export interface WorkoutOrder {
  id: string;
  index: number;
}

export interface CompleteWorkout {
  workoutId: string;
  date: Date;
  intensity: number;
  emoji: string;
  timeTaken: number;
}

export interface ExerciseWeight {
  id?: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setNumber: number;
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

export enum IntensityEnum {
  LOW,
  MOD,
  HIGH,
}

export enum SetType {
  REPS,
  TIME,
}

export interface IProgrammeWorkout {
  weekNumber: number;
  orderIndex: number;
  programme: string;
  localisations: ProgrammeWorkoutLocalisations[];
  intensity: IntensityEnum;
  overviewImageKey?: string;
  duration: number;
  exercises: WorkoutExercise[];
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

export interface RegisterUserInput {
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  gender: string;
  dateOfBirth: string;
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
  sub: string;
}

export interface UserProfile {
  givenName: string;
  familyName: string;
  email: string;
  gender?: string;
  dateOfBirth?: string;
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
  dateOfBirth?: string;
  country?: string;
  region?: string;
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
  HIGH,
  LOW,
}

export interface ChangeDevice {
  deviceId: string;
}

// export interface UserProgramme {
//   id: string;
//   trainer:
// }
