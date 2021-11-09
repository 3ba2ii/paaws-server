"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHONE_NUMBER_REG_EXP = exports.VERIFY_PHONE_NUMBER_PREFIX = exports.FORGET_PASSWORD_PREFIX = exports.COOKIE_NAME = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === 'production';
exports.COOKIE_NAME = 'qid';
exports.FORGET_PASSWORD_PREFIX = 'forget-password:';
exports.VERIFY_PHONE_NUMBER_PREFIX = 'verify-number:';
exports.PHONE_NUMBER_REG_EXP = '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$';
//# sourceMappingURL=constants.js.map