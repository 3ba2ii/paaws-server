"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwner = void 0;
const isOwner = ({ context: { req }, args }, next) => {
    if (!req.session.userId) {
        throw new Error('Not Authenticated');
    }
    const userId = req.session.userId;
    if (userId !== args.id) {
        throw new Error('Not Authorized');
    }
    return next();
};
exports.isOwner = isOwner;
//# sourceMappingURL=isOwner.js.map