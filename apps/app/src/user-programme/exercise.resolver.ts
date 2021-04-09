import { CommonService } from '@lib/common';
import { AuthContext, DownloadQuality } from '@lib/power';
import { AccountLoaders } from '@lib/power/account/account.loaders';
import { Exercise } from '@lib/power/exercise';
import { ConfigService } from '@nestjs/config';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';

const generateKey = (key: string, downloadQuality: DownloadQuality) =>
  downloadQuality === DownloadQuality.HIGH
    ? `${key}_1080.mp4`
    : `${key}_480.mp4`;

@Resolver('Exercise')
export class ExerciseResolver {
  constructor(
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    private readonly accountLoaders: AccountLoaders,
  ) {}

  @ResolveField('id')
  public async getId(@Parent() exercise: Exercise) {
    return exercise.id;
  }

  @ResolveField('name')
  public async getName(
    @Parent() exercise: Exercise,
    @Context('language') language: string,
  ) {
    return exercise.localisations.find(
      (localisation) => localisation.language === language,
    )?.name;
  }

  @ResolveField('coachingTips')
  public async getCoachingTips(
    @Parent() exercise: Exercise,
    @Context('language') language: string,
  ) {
    return exercise.localisations.find(
      (localisation) => localisation.language === language,
    )?.coachingTips;
  }

  @ResolveField('weight')
  public async getWeight(@Parent() exercise: Exercise) {
    return exercise.weight;
  }

  @ResolveField('video')
  public async getVideo(
    @Parent() exercise: Exercise,
    @Context('authContext') user: AuthContext,
  ) {
    if (!exercise.videoKey) {
      return;
    }
    const account = await this.accountLoaders.findById.load(user.id);
    const bucket = this.configService.get('storage.videos');
    return this.commonService.getPresignedUrl(
      generateKey(exercise.videoKey, account.downloadQuality),
      bucket.bucket,
      'getObject',
      bucket.region,
      15,
    );
  }

  @ResolveField('videoEasy')
  public async getVideoEasy(
    @Parent() exercise: Exercise,
    @Context('authContext') user: AuthContext,
  ) {
    if (!exercise.videoKeyEasy) {
      return;
    }
    const account = await this.accountLoaders.findById.load(user.id);
    const bucket = this.configService.get('storage.videos');
    return this.commonService.getPresignedUrl(
      generateKey(exercise.videoKeyEasy, account.downloadQuality),
      bucket.bucket,
      'getObject',
      bucket.region,
      15,
    );
  }

  @ResolveField('videoEasiest')
  public async getVideoEasiest(
    @Parent() exercise: Exercise,
    @Context('authContext') user: AuthContext,
  ) {
    if (!exercise.videoKeyEasiest) {
      return;
    }

    const account = await this.accountLoaders.findById.load(user.id);
    const bucket = this.configService.get('storage.videos');
    return this.commonService.getPresignedUrl(
      generateKey(exercise.videoKeyEasiest, account.downloadQuality),
      bucket.bucket,
      'getObject',
      bucket.region,
      15,
    );
  }
}
