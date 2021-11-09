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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedMissingPosts = exports.VotingResponse = exports.PaginatedReplies = exports.PaginatedComments = exports.PaginatedResponse = exports.CommentResponse = exports.CreateImageResponse = exports.ImageMetaData = exports.DeleteResponse = exports.DeleteMissingPostResponse = exports.CreateMissingPostResponse = exports.ChangePasswordResponse = exports.PaginatedAdoptionPosts = exports.AdoptionPostResponse = exports.PetResponse = exports.RegularResponse = exports.UserResponse = exports.UploadImageResponse = exports.PaginatedUsers = exports.ErrorResponse = exports.FieldError = void 0;
const type_graphql_1 = require("type-graphql");
const Photo_1 = require("../entity/MediaEntities/Photo");
const Pet_1 = require("../entity/PetEntities/Pet");
const AdoptionPost_1 = require("../entity/PostEntities/AdoptionPost");
const User_1 = require("../entity/UserEntities/User");
const Comment_1 = require("./../entity/InteractionsEntities/Comment");
const MissingPost_1 = require("./../entity/PostEntities/MissingPost");
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], FieldError.prototype, "code", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
exports.FieldError = FieldError;
let ErrorResponse = class ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], ErrorResponse.prototype, "errors", void 0);
ErrorResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ErrorResponse);
exports.ErrorResponse = ErrorResponse;
let PaginatedUsers = class PaginatedUsers extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [User_1.User]),
    __metadata("design:type", Array)
], PaginatedUsers.prototype, "users", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedUsers.prototype, "hasMore", void 0);
PaginatedUsers = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedUsers);
exports.PaginatedUsers = PaginatedUsers;
let UploadImageResponse = class UploadImageResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UploadImageResponse.prototype, "url", void 0);
UploadImageResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UploadImageResponse);
exports.UploadImageResponse = UploadImageResponse;
let UserResponse = class UserResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
exports.UserResponse = UserResponse;
let RegularResponse = class RegularResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], RegularResponse.prototype, "success", void 0);
RegularResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], RegularResponse);
exports.RegularResponse = RegularResponse;
let PetResponse = class PetResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Pet_1.Pet, { nullable: true }),
    __metadata("design:type", Pet_1.Pet)
], PetResponse.prototype, "pet", void 0);
PetResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PetResponse);
exports.PetResponse = PetResponse;
let AdoptionPostResponse = class AdoptionPostResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => AdoptionPost_1.AdoptionPost, { nullable: true }),
    __metadata("design:type", AdoptionPost_1.AdoptionPost)
], AdoptionPostResponse.prototype, "adoptionPost", void 0);
AdoptionPostResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], AdoptionPostResponse);
exports.AdoptionPostResponse = AdoptionPostResponse;
let PaginatedAdoptionPosts = class PaginatedAdoptionPosts extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [AdoptionPost_1.AdoptionPost]),
    __metadata("design:type", Array)
], PaginatedAdoptionPosts.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedAdoptionPosts.prototype, "hasMore", void 0);
PaginatedAdoptionPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedAdoptionPosts);
exports.PaginatedAdoptionPosts = PaginatedAdoptionPosts;
let ChangePasswordResponse = class ChangePasswordResponse extends ErrorResponse {
    constructor() {
        super(...arguments);
        this.success = false;
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], ChangePasswordResponse.prototype, "success", void 0);
ChangePasswordResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], ChangePasswordResponse);
exports.ChangePasswordResponse = ChangePasswordResponse;
let CreateMissingPostResponse = class CreateMissingPostResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => MissingPost_1.MissingPost, { nullable: true }),
    __metadata("design:type", MissingPost_1.MissingPost)
], CreateMissingPostResponse.prototype, "post", void 0);
CreateMissingPostResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CreateMissingPostResponse);
exports.CreateMissingPostResponse = CreateMissingPostResponse;
let DeleteMissingPostResponse = class DeleteMissingPostResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => MissingPost_1.MissingPost, { nullable: true }),
    __metadata("design:type", MissingPost_1.MissingPost)
], DeleteMissingPostResponse.prototype, "deletedPost", void 0);
DeleteMissingPostResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], DeleteMissingPostResponse);
exports.DeleteMissingPostResponse = DeleteMissingPostResponse;
let DeleteResponse = class DeleteResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], DeleteResponse.prototype, "deleted", void 0);
DeleteResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], DeleteResponse);
exports.DeleteResponse = DeleteResponse;
let ImageMetaData = class ImageMetaData {
};
__decorate([
    (0, type_graphql_1.Field)(() => Photo_1.Photo),
    __metadata("design:type", Photo_1.Photo)
], ImageMetaData.prototype, "photo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    __metadata("design:type", User_1.User)
], ImageMetaData.prototype, "creator", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ImageMetaData.prototype, "pathName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ImageMetaData.prototype, "uniqueFileName", void 0);
ImageMetaData = __decorate([
    (0, type_graphql_1.ObjectType)()
], ImageMetaData);
exports.ImageMetaData = ImageMetaData;
let CreateImageResponse = class CreateImageResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => ImageMetaData, { nullable: true }),
    __metadata("design:type", ImageMetaData)
], CreateImageResponse.prototype, "metadata", void 0);
CreateImageResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CreateImageResponse);
exports.CreateImageResponse = CreateImageResponse;
let CommentResponse = class CommentResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Comment_1.Comment, { nullable: true }),
    __metadata("design:type", Comment_1.Comment)
], CommentResponse.prototype, "comment", void 0);
CommentResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CommentResponse);
exports.CommentResponse = CommentResponse;
let PaginatedResponse = class PaginatedResponse extends ErrorResponse {
};
__decorate([
    (0, type_graphql_1.Field)({ defaultValue: false }),
    __metadata("design:type", Boolean)
], PaginatedResponse.prototype, "hasMore", void 0);
PaginatedResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedResponse);
exports.PaginatedResponse = PaginatedResponse;
let PaginatedComments = class PaginatedComments extends PaginatedResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1.Comment]),
    __metadata("design:type", Array)
], PaginatedComments.prototype, "comments", void 0);
PaginatedComments = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedComments);
exports.PaginatedComments = PaginatedComments;
let PaginatedReplies = class PaginatedReplies extends PaginatedResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1.Comment]),
    __metadata("design:type", Array)
], PaginatedReplies.prototype, "replies", void 0);
PaginatedReplies = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedReplies);
exports.PaginatedReplies = PaginatedReplies;
let VotingResponse = class VotingResponse extends ErrorResponse {
    constructor() {
        super(...arguments);
        this.success = false;
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { defaultValue: false }),
    __metadata("design:type", Boolean)
], VotingResponse.prototype, "success", void 0);
VotingResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], VotingResponse);
exports.VotingResponse = VotingResponse;
let PaginatedMissingPosts = class PaginatedMissingPosts extends PaginatedResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [MissingPost_1.MissingPost]),
    __metadata("design:type", Array)
], PaginatedMissingPosts.prototype, "missingPosts", void 0);
PaginatedMissingPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedMissingPosts);
exports.PaginatedMissingPosts = PaginatedMissingPosts;
//# sourceMappingURL=responseTypes.js.map