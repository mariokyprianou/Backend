import { Injectable } from '@nestjs/common';
import { ExerciseCategory } from './exercise-category.model';

@Injectable()
export class ExerciseCategoryService {
  // FIND ALL Exercise
  public findAll() {
    return ExerciseCategory.query();
  }

  public count() {
    return ExerciseCategory.query().count();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async delete(id: string) {
    // delete translations
    return ExerciseCategory.query().deleteById(id);
  }

  public async update(id: string, name: string) {
    return ExerciseCategory.query().updateAndFetchById(id, {
      name,
    });
  }

  public async create(name: string) {
    return ExerciseCategory.query().insertAndFetch({
      name,
    });
  }
}
