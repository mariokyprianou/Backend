import { Filter } from '../types';
import { IWorkout } from '../workout';

export type IOnDemandWorkout = IWorkout;

export interface OnDemandWorkoutFilter extends Filter {
  foo?: boolean;
}
