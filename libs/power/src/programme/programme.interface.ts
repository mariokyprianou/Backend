import {
  Filter,
  ProgrammeEnvironment,
  ProgrammeImages,
  ProgrammeLocalisation,
  PublishStatus,
} from '../types';
import { ShareMediaImage } from './share-media.interface';

export interface CreateProgrammeParams {
  trainerId: string;
  fatLoss: number;
  fitness: number;
  muscle: number;
  wellness: number;
  weeksAvailable: number;
  environment: ProgrammeEnvironment;
  status: PublishStatus;
  localisations: ProgrammeLocalisation[];
  images?: ProgrammeImages[];
  shareMediaImages?: ShareMediaImage[];
}

export type UpdateProgrammeParams = Partial<CreateProgrammeParams>;
export interface ProgrammeFilter extends Filter {
  trainerId?: string;
  environment?: ProgrammeEnvironment;
  status?: PublishStatus;
}
