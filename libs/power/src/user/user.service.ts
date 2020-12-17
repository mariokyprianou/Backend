import { Inject, Injectable } from '@nestjs/common';
import { AuthProviderService } from '@td/auth-provider';
import Objection from 'objection';
import { RegisterUserInput } from '../types';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(@Inject('USER') private authProvider: AuthProviderService) {}

  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'first_name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserFilter = {},
  ) {
    const findAllQuery = applyFilter(
      User.query().withGraphJoined('country').withGraphJoined('region'),
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

  public async delete(id: string) {
    const user = await User.query().findById(id);

    await User.query().findById(id).delete();

    // Note: not 100% if the sub should be passed in here
    this.authProvider.delete(user.cognitoSub);

    return user;
  }

  public async create(input: RegisterUserInput) {
    const res = await this.authProvider.registerWithEmailVerificationLink(
      input.email,
      input.password,
      {},
    );

    return User.query().insertAndFetch({
      cognitoSub: res.UserSub,
      firstName: input.givenName,
      lastName: input.familyName,
      email: input.email,
      countryId: input.country,
      regionId: input.region,
      timeZone: input.timeZone,
      deviceUdid: input.deviceUDID,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
    });
  }

  public async sendVerification(username: string) {
    const res = await this.authProvider.resendEmailVerificationLink(username);
    return res;
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
