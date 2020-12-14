import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';

@Injectable()
export class AdministratorService {
  constructor(
    @Inject('ADMIN') private adminAuthProvider: AuthProviderService,
  ) {}

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

  public async findById(id: string) {
    const admin = await this.adminAuthProvider.getUser(id);

    return {
      id: admin.Username,
      email: admin.Username,
      name: admin.UserAttributes['name'] as string,
    };
  }

  public delete(id: string) {
    // TODO
    return null;
  }

  public create(name: string, email: string) {
    // TODO
    return null;
  }

  public update(id: string, name: string, email: string) {
    // TODO
    return null;
  }
}

export interface AdministratorFilter {
  id?: string;
  ids?: string[];
  email?: string;
}
