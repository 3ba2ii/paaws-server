export const __prod__ = process.env.NODE_ENV === 'production';
export const COOKIE_NAME = 'qid';
export const FORGET_PASSWORD_PREFIX = 'forget-password:';
export const VERIFY_PHONE_NUMBER_PREFIX = 'verify-number:';

export const PHONE_NUMBER_REG_EXP =
  '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$';
