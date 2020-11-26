import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class CommonResolver {
  @Query('ping')
  ping() {
    return 'pong!';
  }
}
