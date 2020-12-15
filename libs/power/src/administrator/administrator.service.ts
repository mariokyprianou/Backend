import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';

@Injectable()
export class AdministratorService {
  constructor(
    @Inject('ADMIN') private adminAuthProvider: AuthProviderService,
  ) {}

  public async findAll(
    page = 0,
    perPage = 25,
    sortField = 'name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: AdministratorFilter = {},
  ) {
    const admins = (await this.adminAuthProvider.listUsers()).Users.map(
      (admin) => {
        return {
          id: admin.Username,
          email: admin.Username,
          name: admin.Attributes['custom:name'] as string,
        };
      },
    );

    const adminsFiltered = filterAdmins(admins, filter);

    const startPage = page * perPage;
    const endPage = startPage + perPage;

    return adminsFiltered.slice(startPage, endPage).sort((a, b) => {
      if (!sortOrder || sortOrder == 'ASC') {
        return a[sortField].localeCompare(b[sortField]);
      } else {
        return b[sortField].localeCompare(a[sortField]);
      }
    });
  }

  public async findAllMeta(filter: AdministratorFilter = {}) {
    const admins = (await this.adminAuthProvider.listUsers()).Users.map(
      (admin) => {
        return {
          id: admin.Username,
          email: admin.Username,
          name: admin.Attributes['custom:name'] as string,
        };
      },
    );

    const adminsFiltered = filterAdmins(admins, filter);

    return adminsFiltered.length;
  }

  public async findById(id: string) {
    const admin = await this.adminAuthProvider.getUser(id);

    return {
      id: admin.Username,
      email: admin.Username,
      name: admin.UserAttributes['custom:name'] as string,
    };
  }

  public async delete(id: string) {
    const admin = await this.adminAuthProvider.delete(id);

    return {
      id: admin.Username,
      email: admin.Username,
      name: admin.UserAttributes['custom:name'] as string,
    };
  }

  public async create(name: string, email: string) {
    await this.adminAuthProvider.register(email, null, {
      UserAttributes: [{ Name: 'custom:name', Value: name }],
    });

    return this.findById(email);
  }

  public async update(id: string, name: string, email: string) {
    await this.adminAuthProvider.updateAttributes(id, [
      { Name: 'Username', Value: email },
      { Name: 'custon:name', Value: name },
    ]);

    return this.findById(email);
  }
}

const filterAdmins = (
  admins: { id: string; email: string; name: string }[],
  filter: AdministratorFilter,
) => {
  return admins.filter((admin) => {
    if (filter.id && admin.id != filter.id) {
      return false;
    }

    if (filter.ids && !filter.ids.includes(admin.id)) {
      return false;
    }

    if (filter.email && admin.email != filter.email) {
      return false;
    }

    return true;
  });
};

export interface AdministratorFilter {
  id?: string;
  ids?: string[];
  email?: string;
}
