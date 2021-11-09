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
var Comment_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const class_mixins_1 = require("../../utils/class-mixins");
const MissingPost_1 = require("./../PostEntities/MissingPost");
const User_1 = require("./../UserEntities/User");
const CommentUpdoots_1 = require("./CommentUpdoots");
let Comment = Comment_1 = class Comment extends (0, class_mixins_1.EntityWithDates)((0, class_mixins_1.EntityWithBase)(typeorm_1.BaseEntity)) {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Comment.prototype, "parentId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Comment.prototype, "repliesCount", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Comment.prototype, "text", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Comment.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.comments, { onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], Comment.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Comment.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MissingPost_1.MissingPost, (post) => post.comments, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", MissingPost_1.MissingPost)
], Comment.prototype, "post", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Comment.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Comment.prototype, "isEdited", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [CommentUpdoots_1.CommentUpdoot]),
    (0, typeorm_1.OneToMany)(() => CommentUpdoots_1.CommentUpdoot, (updoot) => updoot.comment, { cascade: true }),
    __metadata("design:type", Array)
], Comment.prototype, "updoots", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [Comment_1]),
    __metadata("design:type", Array)
], Comment.prototype, "replies", void 0);
Comment = Comment_1 = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Comment);
exports.Comment = Comment;
//# sourceMappingURL=Comment.js.map