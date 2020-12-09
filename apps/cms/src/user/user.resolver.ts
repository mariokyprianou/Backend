import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { constructLimits } from '../constructLimits';
import { Filter, IShareMedia, ListMetadata } from '@lib/power/types';
import { Programme } from '@lib/power/programme';
import { ProgrammeService } from '@lib/power/programme/programme.service';
import { IProgramme } from '../../../../libs/power/src/types';
import { CommonService } from '@lib/common';
import { TrainerService } from '@lib/power/trainer';
import { ProgrammeImage } from '@lib/power/programme/programme-image.model';

@Resolver('User')
export class UserResolver {}
