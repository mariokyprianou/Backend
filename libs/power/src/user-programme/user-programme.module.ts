import { Module } from '@nestjs/common';
import { UserProgrammeService } from './user-programme.service';

@Module({
  providers: [UserProgrammeService],
  exports: [UserProgrammeService],
})
export class UserProgrammeModule {}
