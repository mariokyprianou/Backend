import { Injectable } from '@nestjs/common';

@Injectable()
export class AdministratorService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'first_name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: AdminFilter = {},
  ) {
    // TODO
    return [];
  }

  public findAllMeta(filter: AdminFilter = {}) {
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
}

export interface AdminFilter {
  id?: string;
  ids?: string[];
  email?: string;
}
