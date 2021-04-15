import { CreateWorkoutDto } from './create-workout.dto';

// Currently the only way to update an existing workout is to create a copy,
// so all creation fields are also required on update
export class UpdateWorkoutDto extends CreateWorkoutDto {}
