"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERNAL_SERVER_ERROR = exports.CREATE_NOT_AUTHORIZED_ERROR = exports.CREATE_ALREADY_EXISTS_ERROR = exports.CREATE_INVALID_ERROR = exports.CREATE_NOT_FOUND_ERROR = void 0;
const CREATE_NOT_FOUND_ERROR = (field, customMessage) => {
    return {
        field,
        message: customMessage ? customMessage : `${field} not found`,
        code: 404,
    };
};
exports.CREATE_NOT_FOUND_ERROR = CREATE_NOT_FOUND_ERROR;
const CREATE_INVALID_ERROR = (field, customMessage) => {
    return {
        field,
        message: customMessage ? customMessage : `${field} is invalid`,
        code: 400,
    };
};
exports.CREATE_INVALID_ERROR = CREATE_INVALID_ERROR;
const CREATE_ALREADY_EXISTS_ERROR = (field, customMessage) => {
    return {
        field,
        message: customMessage ? customMessage : `${field} already exists`,
        code: 409,
    };
};
exports.CREATE_ALREADY_EXISTS_ERROR = CREATE_ALREADY_EXISTS_ERROR;
const CREATE_NOT_AUTHORIZED_ERROR = (field, customMessage) => {
    return {
        field,
        message: customMessage ? customMessage : `not authorized`,
        code: 401,
    };
};
exports.CREATE_NOT_AUTHORIZED_ERROR = CREATE_NOT_AUTHORIZED_ERROR;
exports.INTERNAL_SERVER_ERROR = {
    field: 'server',
    message: `internal server error`,
    code: 500,
};
//# sourceMappingURL=errors.js.map