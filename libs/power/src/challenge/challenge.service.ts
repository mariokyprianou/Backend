import { Injectable } from '@nestjs/common';
import { CreateChallengeGraphQlInput } from 'apps/cms/src/challenge/challenge.cms.resolver';
import { Challenge } from './challenge.model';

@Injectable()
export class ChallengeService {
  public findAll() {
    return Challenge.query().withGraphJoined('localisations');
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
