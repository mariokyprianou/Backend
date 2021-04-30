import { TransformationImageService, UploadProgressImageDto } from '@lib/power';
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../context';

@Resolver('ProgressImage')
export class TransformationImageResolver {
  constructor(private transformationService: TransformationImageService) {}

  @Mutation('uploadUrl')
  async uploadUrl(@User() user: User): Promise<ProgressImage> {
    return this.transformationService.generateUploadUrl(user.id);
  }

  @Mutation('uploadFailed')
  async uploadFailed(
    @User() user: User,
    @Args('id', ParseUUIDPipe) imageId: string,
  ): Promise<boolean> {
    return this.transformationService.deleteImage({
      accountId: user.id,
      transformationImageId: imageId,
    });
  }

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
}

export interface ProgressImage {
  id: string;
  url?: string;
  createdAt?: Date;
}
