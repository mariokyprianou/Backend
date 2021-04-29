import { CommonService } from '@lib/common';
import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { GraphQLError } from 'graphql';
import { unparse } from 'papaparse';
import { v4 as uuid } from 'uuid';

export interface CsvFormat {
  fields: string[];
  data: string[][];
}

@Injectable()
export class GenerateCsvReportService {
  constructor(private common: CommonService) {}
  public async generateAndUploadCsv(data: any) {
    const key = `reports/${uuid()}`;
    console.log(data);
    const Body = unparse(data);

    // console.log(csvString);
    // console.log(this.common.env().REPORTS_BUCKET);
    try {
      const s3 = new S3({ region: 'ap-south-1' });
      await s3
        .putObject({
          Bucket: this.common.env().REPORTS_BUCKET,
          Key: key,
          ContentType: 'text/csv',
          ContentDisposition: 'attachment',
          Body,
        })
        .promise();

      const accessUrl = await this.common.getPresignedUrl(
        key,
        this.common.env().REPORTS_BUCKET,
      );

      return accessUrl;
    } catch (error) {
      console.log(error);
      throw new GraphQLError('Unable to upload csv for export');
    }
    // return csvString;
  }
}
