import { ArgsType } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export interface ICmsParams<T> {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  filter?: T;
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
