import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';
import Objection from 'objection';
import { RegisterUserInput } from '../types';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER') private authProvider: AuthProviderService, // @Inject('ADMIN') private adminAuthProvider: AuthProviderService,
  ) {}

  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'first_name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserFilter = {},
  ) {
    const findAllQuery = applyFilter(
      User.query()
        .withGraphJoined('country')
        .withGraphJoined('region')
        .withGraphJoined('timeZone'),
      filter,
    );

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserFilter = {}) {
    return applyFilter(User.query(), filter).resultSize();
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public delete(id: string) {
    return User.query().findById(id).delete();
  }

  public async create(input: RegisterUserInput) {
    const res = await this.authProvider.register(input.email, input.password, {
      MessageAction: 'SUPPRESS',
    });

    return User.query().insertAndFetch({
      cognitoSub: res.User.Attributes.find((attr) => attr.Name === 'sub')[
        'Value'
      ],
      firstName: input.givenName,
      lastName: input.familyName,
      email: input.email,
      countryId: input.country,
      regionId: input.region,
      timeZoneId: input.timeZone,
      deviceUdid: input.deviceUDID,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
    });
  }
}

export interface UserFilter {
  id?: string;
  ids?: string[];
  email?: string;
  country?: string;
}

const applyFilter = (
  query: Objection.QueryBuilder<User, User[]>,
  filter: UserFilter,
): Objection.QueryBuilder<User, User[]> => {
  if (filter.id) {
    query.findByIds([filter.id]);
  }

  if (filter.ids) {
    query.findByIds(filter.ids);
  }

  if (filter.email) {
    query.where('email', 'ilike', `%${filter.email}%`);
  }

  if (filter.country) {
    query.where('country', 'ilike', `%${filter.country}%`);
  }

  return query;
};
