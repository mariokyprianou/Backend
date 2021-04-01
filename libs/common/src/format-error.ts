import { BadRequestException } from '@nestjs/common';
import { UserInputError } from 'apollo-server-errors';
import { GraphQLError } from 'graphql';

export const formatError = (error: GraphQLError) => {
  console.log(error.originalError);
  const { originalError } = error;
  if (originalError instanceof BadRequestException) {
    const data = originalError.getResponse();

    return new UserInputError('Request validation failed', {
      messages: typeof data === 'string' ? data : (data as any).message,
    });
  }
  return error;
};
