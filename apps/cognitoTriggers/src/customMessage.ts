import { CustomMessageTriggerHandler } from 'aws-lambda';

const onCustomMessageHandler: CustomMessageTriggerHandler = async (
  event,
  context,
) => {
  console.log('customMessage', JSON.stringify(event));

  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    const resetUrl =
      process.env.DEEP_LINK_BASE_URL +
      'forgotPassword?code=' +
      event.request.codeParameter;

    event.response.emailSubject = 'Forgotten Password';
    event.response.emailMessage = `Your password reset verification code is ${event.request.codeParameter}. Click the link to reset your password using the PASMA app: <a href="${resetUrl}">${resetUrl}</a>`;
  }

  return event;
};

export default onCustomMessageHandler;
