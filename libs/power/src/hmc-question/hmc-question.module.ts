import { Module } from '@nestjs/common';
import { HmcQuestionService } from './hmc-question.service';

@Module({
  providers: [HmcQuestionService],
  exports: [HmcQuestionService],
})
export class HmcQuestionModule {}
