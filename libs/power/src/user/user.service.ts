import { ICmsFilter, ICmsParams } from '@lib/common';
import { applyPagination } from '@lib/database';
import { Injectable } from '@nestjs/common';
import { addDays, isAfter } from 'date-fns';
import Objection, { raw } from 'objection';
import { Country } from '../country';
import { ChangeDevice, RegisterUserInput, UserProfileInput } from '../types';
import { UserPowerService } from '../user-power';
import { User } from './user.model';
import { SubscriptionPlatform, SubscriptionService } from '@td/subscriptions';
import { isNil } from 'lodash';

export interface UpdateUserInput {
  firstName: string;
  lastName: string;
  country: string;
  region?: string;
  timezone: string;
  deviceLimit: Date;
  trainingProgrammeId?: string;
  currentWeek?: number;
  isManuallySubscribed?: boolean;
}

@Injectable()
export class UserService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly userPowerService: UserPowerService,
  ) {}

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
      deviceChange: new Date(),
    });
  }

  public async update(input: UserProfileInput, sub: string) {
    const profile = await User.query()
      .findOne('cognito_sub', sub)
      .throwIfNotFound();

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
    const profile = await User.query()
      .findOne('cognito_sub', sub)
      .throwIfNotFound();
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

      if (!isNil(input.isManuallySubscribed)) {
        await this.subscriptionService.setSubscriptionOverrideStatus({
          accountId,
          enabled: input.isManuallySubscribed,
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
  isSubscribed?: boolean;
  emailMarketing?: boolean;
  subscriptionPlatform?: SubscriptionPlatform;
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
    query.whereIn(
      'account.country_id',
      Country.query()
        .select('id')
        .where('name', 'ilike', `%${filter.country}%`),
    );
  }

  if (!isNil(filter.emailMarketing)) {
    query.where('account.allow_email_marketing', filter.emailMarketing);
  }

  if (!isNil(filter.isSubscribed)) {
    if (filter.isSubscribed) {
      query.where('account.subscription_expires_at', '>', raw('NOW()'));
    } else {
      query.where((qb) =>
        qb
          .whereNull('account.subscription_expires_at')
          .orWhere('account.subscription_expires_at', '<=', raw('NOW()')),
      );
    }
  }

  if (!isNil(filter.subscriptionPlatform)) {
    if (filter.subscriptionPlatform === null) {
      query.whereNull('account.subscription_platform');
    } else {
      query.where('account.subscription_platform', filter.subscriptionPlatform);
    }
  }

  return query;
};

function baseQuery(params: ICmsParams<UserFilter> = {}) {
  const query = User.query().withGraphJoined('country');
  applyFilter(query, params.filter);
  return query;
}
