"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDuplicationError = void 0;
const checkDuplicationError = (err) => {
    const errors = [];
    if (err.detail.includes('already exists')) {
        if (err.detail.includes('email')) {
            errors.push({
                field: 'email',
                message: 'Email already exists',
                code: 409,
            });
        }
        if (err.detail.includes('phone')) {
            errors.push({
                field: 'phone',
                message: 'Phone Number already exists',
                code: 409,
            });
        }
    }
    return errors;
};
exports.checkDuplicationError = checkDuplicationError;
//# sourceMappingURL=checkDuplicationError.js.map