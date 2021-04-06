import {
  Filter,
  ProgrammeEnvironment,
  ProgrammeImages,
  ProgrammeLocalisation,
  PublishStatus,
} from '../types';
import { ShareMediaImage } from './share-media.interface';

export interface UpdateProgrammeParams {
  id: string;
  trainerId: string;
  fatLoss: number;
  fitness: number;
  muscle: number;
  environment: ProgrammeEnvironment;
  status: PublishStatus;
  images?: ProgrammeImages[];
  localisations?: ProgrammeLocalisation[];
  shareMediaImages?: ShareMediaImage[];
}

export interface ProgrammeFilter extends Filter {
  trainerId?: string;
  environment?: ProgrammeEnvironment;
  status?: PublishStatus;
}
