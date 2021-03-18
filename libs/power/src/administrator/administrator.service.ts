import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';

@Injectable()
export class AdministratorService {
  constructor(
    @Inject('ADMIN') private adminAuthProvider: AuthProviderService,
  ) {}

  private buildUser(admin: any) {
    return {
      id: admin.Username,
      email:
        admin.Attributes.find((x) => x.Name == 'email') &&
        (admin.Attributes.find((x) => x.Name == 'email').Value as string),
      name:
        admin.Attributes.find((x) => x.Name == 'custom:name') &&
        (admin.Attributes.find((x) => x.Name == 'custom:name').Value as string),
    };
  }

  public async findAll(
    page = 0,
    perPage = 25,
    sortField = 'name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: AdministratorFilter = {},
  ) {
    // this currently doesn't work. "Cannot read property 'Value' of undefined"
    const admins = (
      await this.adminAuthProvider.listUsers()
    ).Users.map((admin) => this.buildUser(admin));

    const adminsFiltered = filterAdmins(admins, filter);

    const startPage = page * perPage;
    const endPage = startPage + perPage;

    return adminsFiltered
      .sort((a, b) => {
        if (!sortOrder || sortOrder == 'ASC') {
          return a[sortField] >= b[sortField] ? 1 : 0;
        } else {
          return a[sortField] >= b[sortField] ? 0 : 1;
        }
      })
      .slice(startPage, endPage);
  }

  // this currently doesn't work. "Cannot read property 'Value' of undefined"
  public async findAllMeta(filter: AdministratorFilter = {}) {
    const admins = (
      await this.adminAuthProvider.listUsers()
    ).Users.map((admin) => this.buildUser(admin));

    const adminsFiltered = filterAdmins(admins, filter);

    return adminsFiltered.length;
  }

  public async findById(id: string) {
    const admin = await this.adminAuthProvider.getUser(id);

    return {
      id: admin.Username,
      email:
        admin.UserAttributes.find((x) => x.Name == 'email') &&
        (admin.UserAttributes.find((x) => x.Name == 'email').Value as string),
      name:
        admin.UserAttributes.find((x) => x.Name == 'custom:name') &&
        (admin.UserAttributes.find((x) => x.Name == 'custom:name')
          .Value as string),
    };
  }

  public async delete(id: string) {
    const admin = await this.adminAuthProvider.delete(id);

    return {
      id: admin.Username,
      email:
        admin.UserAttributes.find((x) => x.Name == 'email') &&
        (admin.UserAttributes.find((x) => x.Name == 'email').Value as string),
      name:
        admin.UserAttributes.find((x) => x.Name == 'custom:name') &&
        (admin.UserAttributes.find((x) => x.Name == 'custom:name')
          .Value as string),
    };
  }

  public async create(name: string, email: string) {
    await this.adminAuthProvider.register(email, null, {
      UserAttributes: [
        { Name: 'custom:name', Value: name },
        { Name: 'email_verified', Value: 'true' },
      ],
    });

    return this.findById(email);
  }

  public async update(id: string, name: string, email: string) {
    await this.adminAuthProvider.updateAttributes(id, [
      { Name: 'email', Value: email },
      { Name: 'custom:name', Value: name },
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
