import { Injectable } from '@nestjs/common';
import { UpdateUserInput } from 'apps/cms/src/user/user.resolver';
import { addDays, isAfter } from 'date-fns';
import Objection from 'objection';
import { ChangeDevice, RegisterUserInput, UserProfileInput } from '../types';
import { User } from './user.model';

@Injectable()
export class UserService {
  public findAll(
    page = 0,
    perPage = 25,
    sortField = 'first_name',
    sortOrder: 'ASC' | 'DESC' | null = 'ASC',
    filter: UserFilter = {},
  ) {
    const query = User.query().withGraphJoined('[country, region]');
    const findAllQuery = applyFilter(query, filter);

    findAllQuery.limit(perPage).offset(perPage * page);
    findAllQuery.orderBy(sortField, sortOrder);

    return findAllQuery;
  }

  public findAllMeta(filter: UserFilter = {}) {
    return applyFilter(User.query(), filter).resultSize();
  }

  public findBySub(sub: string) {
    return this.findAll().findOne('cognito_sub', sub);
  }

  public findById(id: string) {
    return this.findAll().findById(id);
  }

  public async delete(id: string) {
    const user = await User.query().findById(id);

    await User.query().findById(id).delete();

    return user;
  }

  public async create(input: RegisterUserInput, cognitoSub: string) {
    return User.query().insertAndFetch({
      cognitoSub,
      firstName: input.givenName,
      lastName: input.familyName,
      email: input.email,
      countryId: input.country,
      regionId: input.region,
      timeZone: input.timeZone,
      deviceUdid: input.deviceUDID,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      deviceChange: addDays(new Date(), 30),
    });
  }

  public async update(input: UserProfileInput, sub: string) {
    const profile = await User.query().findOne('cognito_sub', sub);
    await profile.$query().patch({
      firstName: input.givenName,
      lastName: input.familyName,
      countryId: input.country,
      regionId: input.region,
      gender: input.gender,
      dateOfBirth: input.dateOfBirth,
      timeZone: input.timeZone,
    });
    return this.findById(profile.id);
  }

  public async updateEmail(email: string, sub: string) {
    const profile = await User.query().findOne('cognito_sub', sub);
    return profile.$query().patchAndFetch({
      email,
    });
  }

  public async adminUpdate(id: string, input: UpdateUserInput) {
    try {
      const profile = await User.query().findById(id);
      await profile.$query().patch({
        firstName: input.firstName,
        lastName: input.lastName,
        countryId: input.country,
        regionId: input.region,
        timeZone: input.timezone,
        deviceChange: input.deviceLimit
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async updateDevice(input: ChangeDevice, sub: string) {
    const profile = await this.findBySub(sub);
    if (isAfter(new Date(), new Date(profile.deviceChange))) {
      // Time period has elapsed and we can change the device
      await profile.$query().patch({
        deviceUdid: input.deviceId,
        deviceChange: addDays(new Date(), 30),
      });
      return true;
    } else {
      return false;
    }
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
    query.where('account.country.country', 'ilike', `%${filter.country}%`);
  }

  return query;
};
