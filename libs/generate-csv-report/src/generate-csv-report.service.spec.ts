import { Test, TestingModule } from '@nestjs/testing';
import { GenerateCsvReportService } from './generate-csv-report.service';

describe('GenerateCsvReportService', () => {
  let service: GenerateCsvReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenerateCsvReportService],
    }).compile();

    service = module.get<GenerateCsvReportService>(GenerateCsvReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
