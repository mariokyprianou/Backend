import { ArgsType } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export interface ICmsParams<T extends ICmsFilter = ICmsFilter> {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  filter?: T;
}

export interface ICmsFilter {
  id?: string;
  ids?: string[];
}

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
