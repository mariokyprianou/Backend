import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';
import {
  GetUserResponse,
  UserType,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';

const isUserType = (admin: GetUserResponse | UserType): admin is UserType => {
  return (admin as UserType).Attributes !== undefined;
};

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
    const response = await this.adminAuthProvider.listUsers();
    const admins = response.Users.map(toAdmin);

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
    const users = await this.adminAuthProvider.listUsers();
    const admins = users.Users.map(toAdmin);

    const adminsFiltered = filterAdmins(admins, filter);

    return adminsFiltered.length;
  }

  public async findById(id: string) {
    const admin = await this.adminAuthProvider.getUser(id);

    return toAdmin(admin);
  }

  public async delete(id: string) {
    const admin = await this.adminAuthProvider.delete(id);
    return toAdmin(admin);
  }

  public async create(name: string, email: string) {
    await this.adminAuthProvider.register(email, null, {
      UserAttributes: [
        { Name: 'email', Value: email },
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

function toAdmin(admin: GetUserResponse | UserType) {
  const findAttributeValue = (name) => {
    const attributes = isUserType(admin)
      ? admin.Attributes
      : admin.UserAttributes;
    return attributes.find((attr) => attr.Name === name)?.Value;
  };

  return {
    id: admin.Username,
    email: findAttributeValue('email'),
    name: findAttributeValue('custom:name'),
  };
}
