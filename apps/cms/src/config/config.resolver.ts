import { ConfigType } from '@lib/power/config';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CmsConfigService } from './config.service.cms';
import { CmsOnboardingService } from './onboarding.service.cms';

@Resolver('Configuration')
export class ConfigResolver {
  constructor(
    private readonly configService: CmsConfigService,
    private readonly onboardingService: CmsOnboardingService,
  ) {}

  @Query('Configuration')
  async Configuration(): Promise<ConfigurationGraphQlType> {
    const configurations = await this.configService.findAll();
    const onboardings = await this.onboardingService.findAll();

    // TODO: there is probably a better way to get all languages
    const allLanguages = configurations[0].translations.map((x) => x.language);

    return {
      localisations: allLanguages.map((language) => {
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
          onboarding: onboardings.map((onboarding) => {
            const onboardingTranslation = onboarding.translations.find(
              (translation) => translation.language == language,
            );

            return {
              title: onboardingTranslation.title,
              description: onboardingTranslation.description,
              image: onboardingTranslation.imageKey,
            };
          }),
          //   notifications: [],
          notifications: notificationTypes.map((notificationType) => {
            const notification = configurations.find(
              (configuration) => configuration.type == notificationType,
            );

            const notificationTranslation = notification.translations.find(
              (translation) => translation.language == language,
            );

            return {
              type: (notification.type as unknown) as PushNotificationTypeGraphQlType,
              title: notificationTranslation.title,
              body: notificationTranslation.value,
            };
          }),
        };
      }),
    };
  }
}

interface OnboardingConfigGraphQlType {
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
  onboarding: OnboardingConfigGraphQlType[];
  notifications: PushNotificationConfigGraphQlType[];
}

interface ConfigurationGraphQlType {
  localisations: ConfigurationLocalisationGraphQlType[];
}
