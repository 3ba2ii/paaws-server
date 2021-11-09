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
exports.MissingPost = void 0;
const class_mixins_1 = require("../../utils/class-mixins");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const types_1 = require("../../types/types");
const PostUpdoot_1 = require("../InteractionsEntities/PostUpdoot");
const Comment_1 = require("./../InteractionsEntities/Comment");
const User_1 = require("./../UserEntities/User");
const PostImages_1 = require("../MediaEntities/PostImages");
const Photo_1 = require("../MediaEntities/Photo");
let MissingPost = class MissingPost extends (0, class_mixins_1.EntityWithDates)((0, class_mixins_1.EntityWithLocation)((0, class_mixins_1.EntityWithBase)(typeorm_1.BaseEntity))) {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MissingPost.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.missingPosts, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", User_1.User)
], MissingPost.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MissingPost.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MissingPost.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MissingPost.prototype, "descriptionSnippet", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PrivacyType),
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: types_1.PrivacyType,
        default: types_1.PrivacyType.PUBLIC,
    }),
    __metadata("design:type", String)
], MissingPost.prototype, "privacy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PrivacyType),
    (0, typeorm_1.Column)({
        nullable: true,
        type: 'enum',
        enum: types_1.MissingPostTypes,
        default: types_1.MissingPostTypes.Missing,
    }),
    __metadata("design:type", String)
], MissingPost.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PostImages_1.PostImages]),
    (0, typeorm_1.OneToMany)(() => PostImages_1.PostImages, (image) => image.post, { cascade: true }),
    __metadata("design:type", Array)
], MissingPost.prototype, "images", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MissingPost.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PostUpdoot_1.PostUpdoot]),
    (0, typeorm_1.OneToMany)(() => PostUpdoot_1.PostUpdoot, (updoot) => updoot.post, { cascade: true }),
    __metadata("design:type", Array)
], MissingPost.prototype, "updoots", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MissingPost.prototype, "voteStatus", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], MissingPost.prototype, "commentsCount", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1.Comment]),
    (0, typeorm_1.OneToMany)(() => Comment_1.Comment, (comment) => comment.post, { cascade: true }),
    __metadata("design:type", Array)
], MissingPost.prototype, "comments", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MissingPost.prototype, "thumbnailId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Photo_1.Photo, { nullable: true }),
    (0, typeorm_1.OneToOne)(() => Photo_1.Photo, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Photo_1.Photo)
], MissingPost.prototype, "thumbnail", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.MissingPostTags]),
    __metadata("design:type", Array)
], MissingPost.prototype, "tags", void 0);
MissingPost = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], MissingPost);
exports.MissingPost = MissingPost;
//# sourceMappingURL=MissingPost.js.map