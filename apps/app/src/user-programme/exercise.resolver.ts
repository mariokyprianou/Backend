import { CloudFront } from 'aws-sdk';
import { CommonService } from '@lib/common';
import { DownloadQuality } from '@lib/power';
import { AccountLoaders } from '@lib/power/account/account.loaders';
import { Exercise } from '@lib/power/exercise';
import { ConfigService } from '@nestjs/config';
import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../context';
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
  public async getVideo(@Parent() exercise: Exercise, @User() user: User) {
    if (!exercise.videoKey) {
      return;
    }
    const { downloadQuality } = await this.accountLoaders.findById.load(
      user.id,
    );
    return this.getVideoDownloadUrl(exercise.videoKey, downloadQuality);
  }

  @ResolveField('videoEasy')
  public async getVideoEasy(@Parent() exercise: Exercise, @User() user: User) {
    if (!exercise.videoKeyEasy) {
      return;
    }
    const { downloadQuality } = await this.accountLoaders.findById.load(
      user.id,
    );

    return this.getVideoDownloadUrl(exercise.videoKeyEasy, downloadQuality);
  }

  @ResolveField('videoEasiest')
  public async getVideoEasiest(
    @Parent() exercise: Exercise,
    @User() user: User,
  ) {
    if (!exercise.videoKeyEasiest) {
      return;
    }

    const { downloadQuality } = await this.accountLoaders.findById.load(
      user.id,
    );
    return this.getVideoDownloadUrl(exercise.videoKeyEasiest, downloadQuality);
  }

  private getVideoDownloadUrl(key: string, downloadQuality: DownloadQuality) {
    const qualitySpecificKey =
      downloadQuality === DownloadQuality.HIGH
        ? `${key}_1080.mp4`
        : `${key}_480.mp4`;

    const cloudfront = this.configService.get('cloudfront');
    if (cloudfront?.enabled) {
      const { url, privateKey, keypairId } = cloudfront;
      const signer = new CloudFront.Signer(keypairId, privateKey);

      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      return signer.getSignedUrl({
        url: `${url}/${qualitySpecificKey}`,
        expires: Math.floor((new Date().getTime() + ONE_WEEK_MS) / 1000),
      });
    }

    // Cloudfront not configured, use S3 direct

    // Expire the link after 1 week. In reality the link expires along with the lambda IAM credentials
    // but one week is the theoretical max using sigv4.
    const ONE_WEEK = 60 * 24 * 7;

    const { bucket, region } = this.configService.get('storage.videos');
    return this.commonService.getPresignedUrl(
      qualitySpecificKey,
      bucket,
      'getObject',
      region,
      ONE_WEEK,
    );
  }
}
