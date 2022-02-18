import { FieldError } from './types/response.types';

/* CONSTANT ERRORS */
export const CREATE_NOT_FOUND_ERROR = (
  field: string,
  customMessage?: string
): FieldError => {
  return {
    field,
    message: customMessage ? customMessage : `${field} not found`,
    code: 404,
  };
};

export const CREATE_INVALID_ERROR = (
  field: string,
  customMessage?: string
): FieldError => {
  return {
    field,
    message: customMessage ? customMessage : `${field} is invalid`,
    code: 400,
  };
};

export const CREATE_ALREADY_EXISTS_ERROR = (
  field: string,
  customMessage?: string
): FieldError => {
  return {
    field,
    message: customMessage ? customMessage : `${field} already exists`,
    code: 409,
  };
};

export const CREATE_NOT_AUTHORIZED_ERROR = (
  field: string,
  customMessage?: string
): FieldError => {
  return {
    field,
    message: customMessage ? customMessage : `not authorized`,
    code: 401,
  };
};

export const INTERNAL_SERVER_ERROR: FieldError = {
  field: 'server',
  message: `internal server error`,
  code: 500,
};
