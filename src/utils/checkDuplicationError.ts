import { FieldError } from '../types/_responseTypes';

export const checkDuplicationError = (err: any): FieldError[] => {
  const errors: FieldError[] = [];

  if (err.detail.includes('already exists')) {
    if (err.detail.includes('email')) {
      errors.push({
        field: 'email',
        message: 'Email already exists',
      });
    }
    if (err.detail.includes('phone')) {
      errors.push({
        field: 'phone',
        message: 'Phone Number already exists',
      });
    }
  }
  return errors;
};
