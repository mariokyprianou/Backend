import { Injectable } from '@nestjs/common';
import { Challenge } from './challenge.model';

// TODO
type CreateChallengeGraphQlInput = any;

@Injectable()
export class ChallengeService {
  public findAll(language = 'en') {
    // TODO!
    return Challenge.query().withGraphJoined('localisations');
    // .modifyGraph('localisations', (qb) => qb.where('language', language))
    // .orderBy('order_index', 'asc');
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async create(challenge: CreateChallengeGraphQlInput) {
    const challengeModel = await Challenge.query().insertGraphAndFetch(
      challenge,
      {
        relate: true,
      },
    );

    return this.findById(challengeModel.id);
  }
}
