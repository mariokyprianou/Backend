export enum ProgressType {
  NEW_WEEK = 'NEW_WEEK',
  WORKOUT_COMPLETE = 'WORKOUT_COMPLETE',
  NEW_PROGRAMME = 'NEW_PROGRAMME',
}

export interface ProgressDay {
  date: Date;
  type: ProgressType;
}

export interface ProgressMonth {
  startOfMonth: Date;
  days: ProgressDay[];
}
