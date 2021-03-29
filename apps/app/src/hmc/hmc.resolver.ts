import {
  HmcQuestionLocalisationGraphQlType,
  ProgrammeEnvironment,
} from '@lib/power/types';
import { HmcQuestionService, QuestionAnswer } from '@lib/power';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProgrammeService } from '@lib/power/programme';
import { WorkoutService } from '@lib/power/workout';
import { CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';

@Resolver('ProgrammeQuestion')
export class HMCResolver {
  constructor(
    private questionService: HmcQuestionService,
    private programmeService: ProgrammeService,
    private workoutService: WorkoutService,
    private commonService: CommonService,
    private trainerService: TrainerService,
  ) {}

  @Query('programmeQuestionnaire')
  async programmeQuestionnaire(
    @Context('language') language: string,
  ): Promise<ProgrammeQuestionnaire[]> {
    const questionnaire = await this.questionService.findAllQuestions(language);
    return questionnaire.map((question) => ({
      id: question.id,
      orderIndex: question.orderIndex,
      question: question.localisations[0],
    }));
  }

  @Mutation('submitProgrammeQuestionnaire')
  async submitProgrammeQuestionnaire(
    @Context('language') language: string,
    @Args('input')
    input: {
      answers: SubmitPQInput[];
      environment: ProgrammeEnvironment;
    },
  ) {
    const { answers, environment } = input;
    const programmeId = await this.questionService.calculateProgrammeScores(
      answers,
      environment,
    );
    // console.log(programmeId);

    // resolve the programme data
    const programme = await this.programmeService.findById(
      programmeId,
      language,
    );
    if (!programme) {
      throw new Error("Couldn't match a programme");
    }
    // console.log(programme);
    const images = programme.shareMediaImages.find(
      (media) => media.type.toString() === 'PROGRAMME_START',
    );
    const image = images && images.getTranslation(language);

    const firstWeek = await this.workoutService
      .findAll(programme.id)
      .where('week_number', 1);
    // const week = firstWeek[0];

    const primaryProgrammeImage = programme.images.find(
      (image) => image.orderIndex === 0,
    );

    const count = await this.workoutService.findAll(programme.id);

    return {
      programme: {
        id: programme.id,
        trainer: this.trainerService.findById(programme.trainerId, language),
        environment: programme.environment,
        fatLoss: programme.fatLoss,
        fitness: programme.fitness,
        muscle: programme.muscle,
        description: programme.getTranslation(language).description,
        progressStartShareMediaImage: image && {
          url:
            image.imageKey &&
            (await this.commonService.getPresignedUrl(
              image.imageKey,
              this.commonService.env().FILES_BUCKET,
              'getObject',
            )),
          colour: image.colour,
        },
        firstWeek: await Promise.all(
          firstWeek.map(async (week) => ({
            ...week,
            workout: {
              overviewImage:
                week.workout.overviewImageKey &&
                (await this.commonService.getPresignedUrl(
                  week.workout.overviewImageKey,
                  this.commonService.env().FILES_BUCKET,
                  'getObject',
                )),
              intensity: week.workout.intensity,
              duration: week.workout.duration,
              name: week.workout.getTranslation(language).name,
              exercises: null,
            },
          })),
        ),
        programmeImage:
          primaryProgrammeImage &&
          (await this.commonService.getPresignedUrl(
            primaryProgrammeImage.imageKey,
            this.commonService.env().FILES_BUCKET,
            'getObject',
          )),
        numberOfWeeks: count.length,
      },
    };
  }
}

interface ProgrammeQuestionnaire {
  id: string;
  orderIndex: number;
  question: HmcQuestionLocalisationGraphQlType;
}

interface SubmitPQInput {
  question: string;
  answer: QuestionAnswer;
}
