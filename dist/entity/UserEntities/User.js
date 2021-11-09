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
exports.User = exports.ProviderTypes = void 0;
const Notification_1 = require("./../Notification/Notification");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const class_mixins_1 = require("../../utils/class-mixins");
const PostUpdoot_1 = require("../InteractionsEntities/PostUpdoot");
const Photo_1 = require("../MediaEntities/Photo");
const Pet_1 = require("../PetEntities/Pet");
const AdoptionPost_1 = require("../PostEntities/AdoptionPost");
const Comment_1 = require("./../InteractionsEntities/Comment");
const MissingPost_1 = require("./../PostEntities/MissingPost");
const UserFavorites_1 = require("./UserFavorites");
const UserPet_1 = require("./UserPet");
const UserTags_1 = require("./UserTags");
var ProviderTypes;
(function (ProviderTypes) {
    ProviderTypes["LOCAL"] = "local";
    ProviderTypes["GOOGLE"] = "google";
    ProviderTypes["FACEBOOK"] = "facebook";
    ProviderTypes["TWITTER"] = "twitter";
    ProviderTypes["APPLE"] = "apple";
})(ProviderTypes = exports.ProviderTypes || (exports.ProviderTypes = {}));
let User = class User extends (0, class_mixins_1.EntityWithDates)((0, class_mixins_1.EntityWithBase)((0, class_mixins_1.EntityWithLocation)(typeorm_1.BaseEntity))) {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "full_name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: ProviderTypes.LOCAL }),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "provider_id", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "lat", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "lng", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "confirmed", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "blocked", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "last_login", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Photo_1.Photo], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => Photo_1.Photo, (photo) => photo.creator),
    __metadata("design:type", Array)
], User.prototype, "photos", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "avatarId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Photo_1.Photo, { nullable: true }),
    (0, typeorm_1.OneToOne)(() => Photo_1.Photo, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Photo_1.Photo)
], User.prototype, "avatar", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Pet_1.Pet], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => Pet_1.Pet, (pet) => pet.user),
    __metadata("design:type", Array)
], User.prototype, "pets", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [UserTags_1.UserTag], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => UserTags_1.UserTag, (tag) => tag.user),
    __metadata("design:type", Array)
], User.prototype, "tags", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [UserFavorites_1.UserFavorites], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => UserFavorites_1.UserFavorites, (fav) => fav.user),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [UserPet_1.UserPet], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => UserPet_1.UserPet, (userPet) => userPet.user),
    __metadata("design:type", Array)
], User.prototype, "userPets", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [AdoptionPost_1.AdoptionPost], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => AdoptionPost_1.AdoptionPost, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "adoptionPosts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [MissingPost_1.MissingPost], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => MissingPost_1.MissingPost, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "missingPosts", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PostUpdoot_1.PostUpdoot]),
    (0, typeorm_1.OneToMany)(() => PostUpdoot_1.PostUpdoot, (updoot) => updoot.user),
    __metadata("design:type", Array)
], User.prototype, "updoots", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1.Comment]),
    (0, typeorm_1.OneToMany)(() => Comment_1.Comment, (comment) => comment.user),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Notification_1.Notification]),
    (0, typeorm_1.OneToMany)(() => Notification_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
User = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], User);
exports.User = User;
//# sourceMappingURL=User.js.map