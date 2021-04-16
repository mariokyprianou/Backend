import { ArgsType } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ICmsParams } from './common.interface';

@ArgsType()
export class CmsParams<T> implements ICmsParams<T> {
  @IsInt()
  @Min(0)
  @IsOptional()
  page = 0;

  @IsInt()
  @Min(0)
  @IsOptional()
  perPage = 10;

  sortField?: string;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  filter?: T;
}
