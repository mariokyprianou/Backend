import { Injectable } from '@nestjs/common';

@Injectable()
export class AdministratorService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: AdministratorFilter = {},
  ) {
    // TODO
    return [];
  }

  public findAllMeta(filter: AdministratorFilter = {}) {
    // TODO
    return 0;
  }

  public findById(id: string) {
    // TODO
    return null;
  }

  public delete(id: string) {
    // TODO
    return null;
  }

  public create(name: string, email: string) {
    // TODO
    return null;
  }
}

export interface AdministratorFilter {
  id?: string;
  ids?: string[];
  email?: string;
}
