import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';

@Module({
  providers: [AdministratorService],
  exports: [AdministratorService],
})
export class AdministratorModule {}
