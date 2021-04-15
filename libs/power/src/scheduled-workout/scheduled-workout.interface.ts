import { Filter, ProgrammeEnvironment } from '../types';
import { IWorkout } from '../workout';

export interface ScheduledWorkoutFilter extends Filter {
  name?: string;
  trainer?: string;
  environment?: ProgrammeEnvironment;
  week?: number;
  weeks?: number[];
  programmeId?: string;
}

export interface IScheduledWorkout extends IWorkout {
  weekNumber: number;
}
