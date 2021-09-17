import { FieldError2 } from '../types/_responseTypes';

export const checkDuplicationError = (err: any): FieldError2[] => {
  const errors: FieldError2[] = [];

  if (err.detail.includes('already exists')) {
    if (err.detail.includes('email')) {
      errors.push({
        field: 'email',
        message: 'Email already exists',
        code: 409, //Conflict
      });
    }
    if (err.detail.includes('phone')) {
      errors.push({
        field: 'phone',
        message: 'Phone Number already exists',
        code: 409, //Conflict
      });
    }
  }
  return errors;
};
