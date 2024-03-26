import {ZodError} from 'zod';

interface Message {
  [key: string]: string;
}

export const ErrorHandler = (error: ZodError): Message => {
  const errors: Message = {};

  error.issues.map((issue) => {
    errors[issue.path[0]] = issue.message;
  });

  return errors;
};
