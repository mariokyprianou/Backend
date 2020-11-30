export interface TrainerLocalisation {
  language: string;
  name: string;
}

export interface Filter {
  id?: string;
  ids?: string[];
}

export interface ListMetadata {
  count: number;
}
