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
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./../errors");
const graphql_upload_1 = require("graphql-upload");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Photo_1 = require("../entity/MediaEntities/Photo");
const User_1 = require("../entity/UserEntities/User");
const isAuth_1 = require("../middleware/isAuth");
const responseTypes_1 = require("../types/responseTypes");
const PhotoRepo_repo_1 = require("../repos/PhotoRepo.repo");
let PhotoResolver = class PhotoResolver {
    constructor(photoRepo) {
        this.photoRepo = photoRepo;
    }
    url(photo) {
        if (!photo || !(photo === null || photo === void 0 ? void 0 : photo.path))
            return null;
        return `${process.env.APP_URL}/images/${photo.path}`;
    }
    async createPhoto({ filename }, { req }) {
        const userId = req.session.userId;
        const user = await User_1.User.findOne({ id: userId });
        if (!user) {
            return {
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('user')],
            };
        }
        return this.photoRepo.createPhotoObject({ creator: user, filename });
    }
    async uploadAvatar(uploadProps, ctx) {
        const { metadata, errors } = await this.createPhoto(uploadProps, ctx);
        if ((errors === null || errors === void 0 ? void 0 : errors.length) || !metadata) {
            return { errors };
        }
        const { photo: avatar, creator: user, uniqueFileName } = metadata;
        user.avatar = avatar;
        const success = await (0, typeorm_1.getConnection)().transaction(async () => {
            const saved = await this.photoRepo.saveImageToDisk(metadata, uploadProps);
            if (!saved) {
                return false;
            }
            await user.save();
            return true;
        });
        if (success)
            return {
                url: `http://localhost:4000/images/${uniqueFileName}`,
            };
        return {
            errors: [errors_1.INTERNAL_SERVER_ERROR],
        };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Photo_1.Photo]),
    __metadata("design:returntype", Object)
], PhotoResolver.prototype, "url", null);
__decorate([
    __param(0, (0, type_graphql_1.Arg)('image', () => graphql_upload_1.GraphQLUpload)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "createPhoto", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.UploadImageResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('image', () => graphql_upload_1.GraphQLUpload)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhotoResolver.prototype, "uploadAvatar", null);
PhotoResolver = __decorate([
    (0, type_graphql_1.Resolver)(Photo_1.Photo),
    __metadata("design:paramtypes", [PhotoRepo_repo_1.PhotoRepo])
], PhotoResolver);
exports.default = PhotoResolver;
//# sourceMappingURL=photo.js.map