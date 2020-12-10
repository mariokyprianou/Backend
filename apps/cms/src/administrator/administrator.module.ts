import { AdministratorModule } from '@lib/power/administrator';
import { Module } from '@nestjs/common';
import { AdministratorResolver } from './administrator.resolver';

@Module({
  imports: [AdministratorModule],
  providers: [AdministratorResolver],
})
export class AdministratorCMSModule {}
