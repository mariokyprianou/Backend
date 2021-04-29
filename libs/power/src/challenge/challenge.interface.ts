export enum ChallengeType {
  COUNTDOWN = 'COUNTDOWN',
  STOPWATCH = 'STOPWATCH',
  OTHER = 'OTHER',
}

export enum ChallengeUnitType {
  WEIGHT = 'WEIGHT',
  REPS = 'REPS',
  DISTANCE = 'DISTANCE',
}

export interface IChallengeHistory {
  challenge: IChallenge;
  history: IChallengeResult[];
}

export interface IChallengeResult {
  id: string;
  value: string;
  createdAt: Date;
}

export interface IChallenge {
  id: string;
  type: ChallengeType;
  name: string;
  fieldDescription: string;
  fieldTitle: string;
  createdAt?: Date;
  duration?: number;
  unitType?: ChallengeUnitType;
  imageKey?: string;
}
