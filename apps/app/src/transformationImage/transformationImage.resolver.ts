import {
  ConfirmUploadProgressImageDto,
  TransformationImageService,
  UploadProgressImageDto,
} from '@lib/power';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../context';

@Resolver('ProgressImage')
export class TransformationImageResolver {
  constructor(private transformationService: TransformationImageService) {}

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
}

export interface ProgressImage {
  id: string;
  url?: string | Promise<string>;
  createdAt?: Date;
}
