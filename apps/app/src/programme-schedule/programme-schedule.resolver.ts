import { Query, Resolver } from '@nestjs/graphql';
import { User } from '../context';
import { ProgrammeScheduleService } from './programme-schedule.service';

@Resolver('ProgrammeSchedule')
export class ProgrammeScheduleResolver {
  constructor(private readonly service: ProgrammeScheduleService) {}

  @Query('programmeSchedule')
  programmeSchedule(@User() user: User) {
    return this.service.findProgrammeSchedule(user.id, user.language);
  }
}
