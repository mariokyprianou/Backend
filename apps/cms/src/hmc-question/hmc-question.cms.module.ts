import { Module } from '@nestjs/common';
import { HmcQuestionResolver } from './hmc-question.cms.resolver';
import { HmcQuestionModule } from '@lib/power/hmc-question/hmc-question.module';

@Module({
  imports: [HmcQuestionModule],
  providers: [HmcQuestionResolver],
})
export class HmcQuestionCMSModule {}
