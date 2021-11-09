"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const argon2_1 = __importDefault(require("argon2"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const Photo_1 = require("../entity/MediaEntities/Photo");
const Pet_1 = require("../entity/PetEntities/Pet");
const User_1 = require("../entity/UserEntities/User");
const UserTags_1 = require("../entity/UserEntities/UserTags");
const inputTypes_1 = require("../types/inputTypes");
const responseTypes_1 = require("../types/responseTypes");
const types_1 = require("../types/types");
const checkDuplicationError_1 = require("../utils/checkDuplicationError");
const createBaseResolver_1 = require("../utils/createBaseResolver");
const getDisplayName_1 = require("../utils/getDisplayName");
const sendEmail_1 = require("../utils/sendEmail");
const constants_1 = require("./../constants");
const Notification_1 = require("./../entity/Notification/Notification");
const errors_1 = require("./../errors");
const isAuth_1 = require("./../middleware/isAuth");
const AddressRepo_repo_1 = require("./../repos/AddressRepo.repo");
const NotificationRepo_repo_1 = require("./../repos/NotificationRepo.repo");
const sendSMS_1 = require("./../utils/sendSMS");
require('dotenv-safe').config();
const UserBaseResolver = (0, createBaseResolver_1.createBaseResolver)('User', User_1.User);
let UserResolver = class UserResolver extends UserBaseResolver {
    constructor(notificationRepo, addressRepo) {
        super();
        this.notificationRepo = notificationRepo;
        this.addressRepo = addressRepo;
    }
    displayName({ full_name }) {
        return (0, getDisplayName_1.getDisplayName)(full_name);
    }
    async avatar({ avatarId }, { dataLoaders: { photoLoader } }) {
        if (!avatarId)
            return undefined;
        return photoLoader.load(avatarId);
    }
    pets(user) {
        return Pet_1.Pet.find({ where: { user } });
    }
    me({ req }) {
        return User_1.User.findOne(req.session.userId);
    }
    notifications({ req }) {
        const { userId } = req.session;
        return this.notificationRepo.getNotificationsByUserId(userId);
    }
    usersCount() {
        return User_1.User.count();
    }
    async users({ cursor, limit }) {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replacements = [realLimitPlusOne];
        if (cursor)
            replacements.push(new Date(cursor));
        const users = await (0, typeorm_1.getConnection)().query(`
          select * from public."user"
          ${cursor ? 'where "createdAt" < $2' : ''}
          order by "createdAt" DESC
          limit $1;
    `, replacements);
        return {
            users: users.slice(0, realLimit),
            hasMore: users.length === realLimitPlusOne,
        };
    }
    user(id) {
        return User_1.User.findOne(id);
    }
    async sendOTP(phone, email, { redis }) {
        var otp = Math.floor(1000 + Math.random() * 9000);
        const phoneNumberRegExp = new RegExp(constants_1.PHONE_NUMBER_REG_EXP);
        if (!phoneNumberRegExp.test(phone)) {
            return {
                success: false,
                errors: [(0, errors_1.CREATE_INVALID_ERROR)('phone')],
            };
        }
        const user = await User_1.User.findOne({ where: [{ phone }, { email }] });
        if (user) {
            const errors = [];
            if (user.email === email) {
                errors.push((0, errors_1.CREATE_ALREADY_EXISTS_ERROR)('email', 'Email is already associated with an account'));
            }
            if (user.phone === phone) {
                errors.push((0, errors_1.CREATE_ALREADY_EXISTS_ERROR)('phone', 'Phone number is already registered'));
            }
            return {
                success: false,
                errors,
            };
        }
        await redis.set(constants_1.VERIFY_PHONE_NUMBER_PREFIX + phone, otp, 'ex', 60 * 10);
        const { sent } = await (0, sendSMS_1.sendSMS)(`Your OTP is ${otp}`, phone);
        if (!sent) {
            return {
                success: false,
                errors: [errors_1.INTERNAL_SERVER_ERROR],
            };
        }
        return { success: true };
    }
    async register(registerOptions, { req, redis }) {
        const { email, full_name, otp, password, phone } = registerOptions;
        const redisKey = constants_1.VERIFY_PHONE_NUMBER_PREFIX + phone;
        const storedOTP = await redis.get(redisKey);
        const isValidOTP = (storedOTP === null || storedOTP === void 0 ? void 0 : storedOTP.toString()) === otp.toString();
        if ((!isValidOTP || !storedOTP) && constants_1.__prod__) {
            return {
                errors: [(0, errors_1.CREATE_INVALID_ERROR)('otp')],
            };
        }
        const hashedPassword = await argon2_1.default.hash(password);
        const user = User_1.User.create({
            full_name,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            phone,
            confirmed: true,
            last_login: new Date(),
        });
        try {
            await user.save();
            await redis.del(redisKey);
            req.session.userId = user.id;
            return { user };
        }
        catch (err) {
            const errors = (0, checkDuplicationError_1.checkDuplicationError)(err);
            return {
                errors,
            };
        }
    }
    async login(options, { req }) {
        const { identifier, password } = options;
        let processedIdentifier = identifier.trim().toLowerCase();
        const user = await User_1.User.findOne(identifier.includes('@')
            ? { where: { email: processedIdentifier } }
            : { where: { phone: processedIdentifier } });
        if (!user) {
            return {
                errors: [
                    (0, errors_1.CREATE_NOT_AUTHORIZED_ERROR)('identifier', 'Incorrect Phone Number or Email'),
                ],
            };
        }
        const valid = await argon2_1.default.verify(user.password, password);
        if (!valid) {
            return {
                errors: [(0, errors_1.CREATE_NOT_AUTHORIZED_ERROR)('password', 'Incorrect password')],
            };
        }
        user.last_login = new Date();
        user.save();
        req.session.userId = user.id;
        return { user };
    }
    async logout({ req, res }) {
        return new Promise((response) => {
            var _a;
            return (_a = req.session) === null || _a === void 0 ? void 0 : _a.destroy((err) => {
                res.clearCookie(constants_1.COOKIE_NAME);
                if (err)
                    response(false);
                response(true);
            });
        });
    }
    async forgotPassword(identifier, { redis }) {
        const isEmail = identifier.includes('@');
        const processedIdentifier = identifier.trim().toLowerCase();
        const user = await User_1.User.findOne(isEmail
            ? { where: { email: processedIdentifier } }
            : { where: { phone: processedIdentifier } });
        if (!user)
            return true;
        const otp = Math.floor(1000 + Math.random() * 9000);
        const token = isEmail ? (0, uuid_1.v4)() : otp;
        const expirationDate = isEmail ? 60 * 60 * 24 : 60 * 10;
        await redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'ex', expirationDate);
        try {
            isEmail
                ? await (0, sendEmail_1.sendEmail)(processedIdentifier, `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`, 'Reset Password Email')
                : await (0, sendSMS_1.sendSMS)(`Your requested a reset password here is your ${otp}`, processedIdentifier);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async isValidToken(token, { redis }) {
        const userId = await redis.get(constants_1.FORGET_PASSWORD_PREFIX + token);
        if (!userId)
            return false;
        return true;
    }
    async changePassword({ redis }, options) {
        const { token, password, confirmPassword } = options;
        if (password !== confirmPassword) {
            return {
                success: false,
                errors: [
                    (0, errors_1.CREATE_INVALID_ERROR)('confirmPassword', 'Passwords do not match'),
                ],
            };
        }
        const tokenRedisKey = constants_1.FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(tokenRedisKey);
        if (!userId) {
            return {
                success: false,
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('token')],
            };
        }
        const userIdNum = parseInt(userId);
        const user = await User_1.User.findOne({ id: userIdNum });
        if (!user) {
            return {
                success: false,
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('user')],
            };
        }
        const hashedPassword = await argon2_1.default.hash(password);
        await User_1.User.update({ id: userIdNum }, { password: hashedPassword });
        await redis.del(tokenRedisKey);
        return {
            success: true,
        };
    }
    async addUserTag(tag, { req }) {
        const user = await User_1.User.findOne({ id: req.session.userId });
        const newTag = UserTags_1.UserTag.create({ user, tagName: tag });
        try {
            await (0, typeorm_1.getConnection)().manager.insert(UserTags_1.UserTag, newTag);
            return true;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    async updateUser(updateOptions, { req }) {
        const { bio, lat, lng } = updateOptions;
        const userId = req.session.userId;
        const user = await User_1.User.findOne({ id: userId });
        if (!user)
            return false;
        if (bio) {
            user.bio = bio;
        }
        if (lat && lng) {
            user.lat = lat;
            user.lng = lng;
        }
        await user.save().catch((err) => {
            console.log(`🚀 ~ file: user.ts ~ line 428 ~ UserResolver ~ err`, err);
            return false;
        });
        return true;
    }
    getNearestUsers({ lat, lng, radius }) {
        return this.addressRepo.findNearestUsers(lat, lng, radius);
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", String)
], UserResolver.prototype, "displayName", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Photo_1.Photo, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "avatar", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [Pet_1.Pet]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "pets", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Notification_1.Notification]),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "notifications", null);
__decorate([
    (0, type_graphql_1.Query)(() => type_graphql_1.Int),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "usersCount", null);
__decorate([
    (0, type_graphql_1.Query)(() => responseTypes_1.PaginatedUsers),
    __param(0, (0, type_graphql_1.Arg)('where', () => inputTypes_1.WhereClause)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.WhereClause]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, {
        nullable: true,
    }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.RegularResponse),
    __param(0, (0, type_graphql_1.Arg)('phone')),
    __param(1, (0, type_graphql_1.Arg)('email')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "sendOTP", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.UserResponse),
    __param(0, (0, type_graphql_1.Arg)('registerOptions')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.RegisterOptions, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('identifier')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Query)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "isValidToken", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.ChangePasswordResponse),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputTypes_1.ChangePasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('tag', () => types_1.UserTagsType)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "addUserTag", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('updateOptions')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.UpdateUserInfo, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateUser", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User], { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.FindNearestUsersInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getNearestUsers", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User),
    __metadata("design:paramtypes", [NotificationRepo_repo_1.NotificationRepo,
        AddressRepo_repo_1.AddressRepo])
], UserResolver);
exports.default = UserResolver;
//# sourceMappingURL=user.js.map