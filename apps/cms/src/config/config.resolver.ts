import { Onboarding } from '@lib/power/onboarding';
import { Config, ConfigType } from '@lib/power/config';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {
  CmsConfigService,
  ConfigTranslationData,
  ConfigurationServiceType,
} from './config.service.cms';
import {
  CmsOnboardingService,
  OnboardingServiceType,
  OnboardingTranslationData,
} from './onboarding.service.cms';
import { CommonService } from '@lib/common';

// Previous implementation of this didn't work
// The original didn't update the locales
// I've tried to remove as much code as possible without breaking
@Resolver('Configuration')
export class ConfigResolver {
  constructor(
    private readonly configService: CmsConfigService,
    private readonly onboardingService: CmsOnboardingService,
    private common: CommonService,
  ) {}

  @ResolveField('localisations')
  async resolveOnboardings(@Parent() config: ConfigurationGraphQlType) {
    return Promise.all(
      config.localisations.map(async (locale) => ({
        ...locale,
        onboardings: await Promise.all(
          locale.onboardings.map(async (onboarding) => ({
            ...onboarding,
            image: {
              key: onboarding.image,
              url: this.common.getPresignedUrl(
                onboarding.image,
                this.common.env().FILES_BUCKET,
              ),
            },
          })),
        ),
      })),
    );
  }

  @Query('Configuration')
  async Configuration(): Promise<ConfigurationGraphQlType> {
    return this.fetchConfiguration();
  }

  @Mutation('updateConfiguration')
  async updateConfiguration(
    @Args('input') input: ConfigurationGraphQlType,
  ): Promise<ConfigurationGraphQlType> {
    const notificationTranslations: ConfigTranslationData[] = input.localisations.flatMap(
      (localisation) => {
        return localisation.notifications.map((notification) => {
          return {
            type: (notification.type as unknown) as ConfigType,
            language: localisation.language,
            value: notification.body,
            title: notification.title,
          };
        });
      },
    );

    const onboardingTranslations: OnboardingTranslationData[] = input.localisations.flatMap(
      (localisation) => {
        return localisation.onboardings.map((onboarding) => {
          return {
            orderIndex: onboarding.orderIndex,
            language: localisation.language,
            title: onboarding.title,
            description: onboarding.description,
            image: onboarding.image,
          };
        });
      },
    );

    const onboarding: OnboardingServiceType[] = onboardingTranslations.reduce(
      (prev, curr) => {
        const existing = prev.find(
          (each) => each.orderIndex === curr.orderIndex,
        );

        if (!existing) {
          return [
            ...prev,
            {
              orderIndex: curr.orderIndex,
              localisations: [
                {
                  language: curr.language,
                  title: curr.title,
                  description: curr.description,
                  imageKey: curr.image,
                },
              ],
            },
          ];
        }

        return [
          ...prev.filter((filt) => filt.orderIndex !== existing.orderIndex),
          {
            ...existing,
            localisations: [
              ...existing.localisations,
              {
                language: curr.language,
                title: curr.title,
                description: curr.description,
                imageKey: curr.image,
              },
            ],
          },
        ];
      },
      [],
    );

    await this.onboardingService.updateTranslations(onboarding);

    const termsAndConditions: ConfigurationServiceType = {
      type: ConfigType.TERMS,
      localisations: input.localisations.map((localisation) => {
        return {
          language: localisation.language,
          value: localisation.termsAndConditions,
          title: 'Terms and Conditions',
        };
      }),
    };
    const privacyPolicy: ConfigurationServiceType = {
      type: ConfigType.PRIVACY,
      localisations: input.localisations.map((localisation) => {
        return {
          language: localisation.language,
          value: localisation.privacyPolicy,
          title: 'Privacy Policy',
        };
      }),
    };
    const notification: ConfigurationServiceType[] = notificationTranslations.reduce(
      (prev, curr) => {
        const existing = prev.find((each) => each.type === curr.type);

        if (!existing) {
          return [
            ...prev,
            {
              type: curr.type,
              localisations: [
                {
                  language: curr.language,
                  title: curr.title,
                  value: curr.value,
                },
              ],
            },
          ];
        }

        return [
          ...prev.filter((filt) => filt.type !== existing.type),
          {
            ...existing,
            localisations: [
              ...existing.localisations,
              { language: curr.language, title: curr.title, value: curr.value },
            ],
          },
        ];
      },
      [],
    );

    const config: ConfigurationServiceType[] = [
      ...notification,
      termsAndConditions,
      privacyPolicy,
    ];

    await this.configService.updateTranslations(config);

    return this.fetchConfiguration();
  }

  private async fetchConfiguration(): Promise<ConfigurationGraphQlType> {
    const configurations = await this.configService.findAll();
    const onboardings = await this.onboardingService.findAll();

    // TODO: there is probably a better way to get all languages
    const allLanguages = configurations[0].translations.map((x) => x.language);

    return {
      localisations: allLanguages.map((language) =>
        createConfigurationLocalisationGraphQlType(
          language,
          configurations,
          onboardings,
        ),
      ),
    };
  }
}

const createConfigurationLocalisationGraphQlType = (
  language: string,
  configurations: Config[],
  onboardings: Onboarding[],
): ConfigurationLocalisationGraphQlType => {
  const termsConf = configurations.find(
    (configuration) => configuration.type == ConfigType.TERMS,
  );

  const privacyConfig = configurations.find(
    (configuration) => configuration.type == ConfigType.PRIVACY,
  );

  const termsConfigTranslation = termsConf.translations.find(
    (translation) => translation.language == language,
  );

  const privacyConfigTranslation = privacyConfig.translations.find(
    (translation) => translation.language == language,
  );

  const notificationTypes = [
    ConfigType.THREE_DAYS_WITHOUT_TRAINING,
    ConfigType.TWO_WEEKS_WITHOUT_OPENING_APP,
    ConfigType.SEVEN_DAYS_WITHOUT_LOGGING_CHALLENGE,
    ConfigType.NEW_TRAINER_ADDED,
    ConfigType.NEW_CHALLENGE_ADDED,
    ConfigType.END_OF_COMPLETED_WORKOUT_WEEK,
  ];

  return {
    language: language,
    termsAndConditions: termsConfigTranslation.value,
    privacyPolicy: privacyConfigTranslation.value,
    onboardings:
      onboardings &&
      onboardings.map((onboarding) => {
        const onboardingTranslation = onboarding.translations.find(
          (translation) => translation.language == language,
        );

        return {
          orderIndex: onboarding.orderIndex,
          title: onboardingTranslation.title,
          description: onboardingTranslation.description,
          image: onboardingTranslation.imageKey,
        };
      }),
    notifications: notificationTypes
      .map((notificationType) => {
        const notification = configurations.find(
          (configuration) => configuration.type == notificationType,
        );

        if (!notification) {
          return;
        }

        const notificationTranslation = notification.translations.find(
          (translation) => translation.language == language,
        );

        return {
          type: (notification.type as unknown) as PushNotificationTypeGraphQlType,
          title: notificationTranslation.title,
          body: notificationTranslation.value,
        };
      })
      .filter((each) => each),
  };
};

export interface OnboardingConfigGraphQlType {
  orderIndex: number;
  title: string;
  description: string;
  image: string;
}

enum PushNotificationTypeGraphQlType {
  THREE_DAYS_WITHOUT_TRAINING,
  TWO_WEEKS_WITHOUT_OPENING_APP,
  SEVEN_DAYS_WITHOUT_LOGGING_CHALLENGE,
  NEW_TRAINER_ADDED,
  NEW_CHALLENGE_ADDED,
  END_OF_COMPLETED_WORKOUT_WEEK,
}

interface PushNotificationConfigGraphQlType {
  type: PushNotificationTypeGraphQlType;
  title: string;
  body: string;
}

interface ConfigurationLocalisationGraphQlType {
  language: string;
  termsAndConditions: string;
  privacyPolicy: string;
  onboardings: OnboardingConfigGraphQlType[];
  notifications: PushNotificationConfigGraphQlType[];
}

interface ConfigurationGraphQlType {
  localisations: ConfigurationLocalisationGraphQlType[];
}
