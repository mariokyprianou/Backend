import { Filter, ProgrammeEnvironment } from '../types';

export interface WorkoutFilter extends Filter {
  name?: string;
  trainer?: string;
  environment?: ProgrammeEnvironment;
  week?: number;
  weeks?: number[];
  programmeId?: string;
}
