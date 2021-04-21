import { ICmsFilter, ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { UpdateUserInput } from 'apps/cms/src/user/user.resolver';
import { addDays, isAfter } from 'date-fns';
import Objection from 'objection';
import { ChangeDevice, RegisterUserInput, UserProfileInput } from '../types';
import { UserPowerService } from '../user-power';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(private readonly userPowerService: UserPowerService) {}

  public findAll(params: ICmsParams<UserFilter>): Promise<User[]> {
    const query = baseQuery(params);
    applyPagination(query, params);
    query.orderBy(params.sortField ?? 'first_name', params.sortOrder ?? 'ASC');
    return query;
  }

  public findAllMeta(filter: UserFilter = {}) {
    const query = User.query();
    return applyFilter(query, filter).resultSize();
  }

  public findBySub(sub: string) {
    return baseQuery().findOne('cognito_sub', sub);
  }

  public findById(id: string) {
    return baseQuery({ filter: { id } }).first();
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

  public async adminUpdate(accountId: string, input: UpdateUserInput) {
    try {
      const profile = await User.query().findById(accountId).throwIfNotFound();
      await profile.$query().patch({
        firstName: input.firstName,
        lastName: input.lastName,
        countryId: input.country,
        regionId: input.region,
        timeZone: input.timezone,
        deviceChange: input.deviceLimit,
      });

      if (input.currentWeek) {
        await this.userPowerService.setUserProgramme({
          accountId,
          weekNumber: input.currentWeek,
        });
      }

      return true;
    } catch (error) {
      console.log(error);
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

export interface UserFilter extends ICmsFilter {
  id?: string;
  ids?: string[];
  email?: string;
  country?: string;
}

const applyFilter = (
  query: Objection.QueryBuilder<User, User[]>,
  filter: UserFilter,
): Objection.QueryBuilder<User, User[]> => {
  if (!filter) {
    return;
  }

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
    query.where('country.name', 'ilike', `%${filter.country}%`);
  }

  return query;
};

function baseQuery(params: ICmsParams<UserFilter> = {}) {
  const query = User.query().withGraphJoined('[country, region]');
  applyFilter(query, params.filter);
  return query;
}
