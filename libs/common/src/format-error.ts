import { BadRequestException } from '@nestjs/common';
import { UserInputError, ValidationError } from 'apollo-server-express';
import { GraphQLError } from 'graphql';
import { NotFoundError } from 'objection';

export const formatError = (error: GraphQLError) => {
  const { originalError } = error;
  if (originalError instanceof BadRequestException) {
    const data = originalError.getResponse();

    return new UserInputError('Request validation failed', {
      messages: typeof data === 'string' ? data : (data as any).message,
    });
  }

  // ObjectionJS Error Conversion
  if (originalError instanceof NotFoundError) {
    if (originalError.data?.modelClass) {
      // User facing
      return new ValidationError(
        `${originalError.data?.modelClass.name} not found.`,
      );
    }
  }

  return error;
};
