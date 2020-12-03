import { Injectable } from '@nestjs/common';
import { HmcQuestion } from './hmc-question.model';

@Injectable()
export class HmcQuestionService {
  public findAll() {
    return HmcQuestion.query()
      .withGraphFetched('translations')
      .withGraphFetched('scores');
  }

  // public count() {
  //   return ExerciseCategory.query().count();
  // }

  // public findById(id: string) {
  //   return this.findAll().findById(id);
  // }

  // public async delete(id: string) {
  //   // delete translations
  //   return ExerciseCategory.query().deleteById(id);
  // }

  // public async update(id: string, name: string) {
  //   return ExerciseCategory.query().updateAndFetchById(id, {
  //     name,
  //   });
  // }

  // public async create(name: string) {
  //   return ExerciseCategory.query().insertAndFetch({
  //     name,
  //   });
  // }
}
