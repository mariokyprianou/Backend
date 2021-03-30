import { Filter } from '../types';

export interface ExerciseFilter extends Filter {
  name?: string;
  trainer?: string;
}
