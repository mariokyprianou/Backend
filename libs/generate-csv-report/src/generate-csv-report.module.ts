import { CommonModule } from '@lib/common';
import { Module } from '@nestjs/common';
import { GenerateCsvReportService } from './generate-csv-report.service';

@Module({
  imports: [CommonModule],
  providers: [GenerateCsvReportService],
  exports: [GenerateCsvReportService],
})
export class GenerateCsvReportModule {}
