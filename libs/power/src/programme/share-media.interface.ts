export enum ShareMediaImageType {
  PROGRAMME_START = 'PROGRAMME_START',
  WEEK_COMPLETE = 'WEEK_COMPLETE',
  CHALLENGE_COMPLETE = 'CHALLENGE_COMPLETE',
  PROGRESS = 'PROGRESS',
}

export interface ShareMediaImage {
  id: string;
  type: ShareMediaImageType;
  localisations: ShareMediaImageLocalisation[];
}

export interface ShareMediaImageLocalisation {
  language: string;
  imageKey: string;
  colour: string;
}
