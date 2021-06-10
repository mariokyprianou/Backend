import { ImageHandlerObjectStore, IMAGE_CDN } from '@lib/common';
import {
  ConfirmUploadProgressImageDto,
  TransformationImageService,
  UploadProgressImageDto,
} from '@lib/power';
import { Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from '../context';

@Resolver('ProgressImage')
export class TransformationImageResolver {
  constructor(
    private transformationService: TransformationImageService,
    @Inject(IMAGE_CDN) private imageStore: ImageHandlerObjectStore,
  ) {}

  @Query('progressImages')
  async progressImages(@User() user: User): Promise<ProgressImage[]> {
    return this.transformationService.getUserImages(user.id);
  }

  @Query('progressImage')
  async progressImage(
    @Args('input') input: ProgressImage,
    @User() user: User,
  ): Promise<ProgressImage> {
    return this.transformationService.getImage({
      accountId: user.id,
      createdAt: input.createdAt,
      transformationImageId: input.id,
    });
  }

  @Mutation('uploadProgressImage')
  async uploadProgressImage(
    @User() user: User,
    @Args('input') input: UploadProgressImageDto,
  ) {
    return this.transformationService.getUploadDetails(user.id, input);
  }

  @Mutation('confirmUploadProgressImage')
  async confirmUploadProgressImage(
    @User() user: User,
    @Args('input') input: ConfirmUploadProgressImageDto,
  ) {
    const progressImage = await this.transformationService.confirmUploadDetails(
      user.id,
      input.token,
    );
    return { success: true, progressImage };
  }

  @ResolveField('url')
  async getUrl(@Parent() progressImage: ProgressImage) {
    return this.imageStore.getSignedUrl(progressImage.imageKey, {
      expiresIn: 60 * 24 * 7,
      resize: {
        width: 720,
      },
    });
    // this.s3.getSignedUrlPromise('getObject', {
    //   Bucket: this.bucket,
    //   Key: ,
    // }),
  }
}

export interface ProgressImage {
  id: string;
  imageKey: string;
  createdAt?: Date;
}
