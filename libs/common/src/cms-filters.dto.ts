import { ArgsType } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

@ArgsType()
export class CmsParams<T> {
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
