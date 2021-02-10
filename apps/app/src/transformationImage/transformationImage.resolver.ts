import { TransformationImageService } from '@lib/power/transformation-image';
import { AuthContext } from '@lib/power/types';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

@Resolver('ProgressImage')
export class TransformationImageResolver {
  constructor(private transformationService: TransformationImageService) {}

  @Mutation('uploadUrl')
  async uploadUrl(
    @Context('authContext') authContext: AuthContext,
  ): Promise<ProgressImage> {
    return this.transformationService.generateUploadUrl(authContext);
  }

  @Mutation('uploadFailed')
  async uploadFailed(
    @Context('authContext') authContext: AuthContext,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.transformationService.deleteImage(id, authContext);
  }

  @Query('progressImages')
  async progressImages(
    @Context('authContext') authContext: AuthContext,
  ): Promise<ProgressImage[]> {
    return this.transformationService.allImages(authContext);
  }

  @Query('progressImage')
  async progressImage(
    @Args('input') input: ProgressImage,
    @Context('authContext') authContext: AuthContext,
  ): Promise<ProgressImage> {
    return this.transformationService.getImage(
      input.id,
      input.createdAt,
      authContext,
    );
  }
}

export interface ProgressImage {
  id: string;
  url?: string;
  createdAt?: Date;
}
