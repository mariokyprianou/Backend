import { CommonService } from '@lib/common';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { unparse } from 'papaparse/papaparse.min';

export interface CsvFormat {
  fields: string[];
  data: string[][];
}

@Injectable()
export class GenerateCsvReportService {
  constructor(private common: CommonService) {}
  public async generateAndUploadCsv(data: CsvFormat) {
    const key = `${uuid()}`;
    const csvString = unparse(data);

    // TODO: this doesn't appear to be doing the actual upload
    await this.common.uploadObject(
      key,
      this.common.env().REPORTS_BUCKET,
      'text/csv',
      csvString,
    );

    const accessUrl = await this.common.getPresignedUrl(
      key,
      this.common.env().REPORTS_BUCKET,
    );

    return csvString;
  }
}
