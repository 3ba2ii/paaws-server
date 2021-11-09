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
exports.CommentResolver = void 0;
const MissingPost_1 = require("./../entity/PostEntities/MissingPost");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Comment_1 = require("./../entity/InteractionsEntities/Comment");
const CommentUpdoots_1 = require("./../entity/InteractionsEntities/CommentUpdoots");
const User_1 = require("./../entity/UserEntities/User");
const errors_1 = require("./../errors");
const isAuth_1 = require("./../middleware/isAuth");
const UpdootRepo_repo_1 = require("./../repos/UpdootRepo.repo");
const inputTypes_1 = require("./../types/inputTypes");
const responseTypes_1 = require("./../types/responseTypes");
let CommentResolver = class CommentResolver {
    constructor(updootRepo) {
        this.updootRepo = updootRepo;
    }
    async getReplies(parentId, cursor, limit = 3) {
        const realLimit = Math.min(limit, 50);
        const realLimitPlusOne = realLimit + 1;
        const replies = await Comment_1.Comment.find({
            where: {
                parentId: typeof parentId === 'number' ? parentId : (0, typeorm_1.In)(parentId),
                createdAt: (0, typeorm_1.LessThan)(cursor ? new Date(cursor) : new Date()),
            },
            order: { createdAt: 'DESC' },
            take: realLimitPlusOne,
        });
        return {
            comments: replies.slice(0, realLimit),
            hasMore: replies.length === realLimitPlusOne,
        };
    }
    async comments({ limit, postId, cursor }) {
        const realLimit = Math.min(limit, 50);
        const realLimitPlusOne = realLimit + 1;
        const comments = await Comment_1.Comment.find({
            where: {
                postId,
                parentId: null,
                createdAt: (0, typeorm_1.LessThan)(cursor ? new Date(cursor) : new Date()),
            },
            order: { createdAt: 'DESC' },
            take: realLimitPlusOne,
        });
        const { comments: replies, errors } = await this.getReplies(comments.map((c) => c.id), null, 3);
        if (errors && (errors === null || errors === void 0 ? void 0 : errors.length) > 0)
            return {
                errors,
            };
        if (replies)
            comments.forEach((comment) => {
                comment.replies = replies.filter((reply) => reply.parentId === comment.id);
            });
        return {
            comments: comments.slice(0, realLimit),
            hasMore: comments.length === realLimitPlusOne,
        };
    }
    async editComment({ req }, commentId, text) {
        if (text == null ||
            (typeof text === 'string' && text.trim().length === 0)) {
            return {
                errors: [(0, errors_1.CREATE_INVALID_ERROR)('text')],
            };
        }
        const comment = await Comment_1.Comment.findOne(commentId);
        if (!comment) {
            return {
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('comment')],
            };
        }
        if (comment.userId !== req.session.userId) {
            return {
                errors: [
                    (0, errors_1.CREATE_NOT_AUTHORIZED_ERROR)('comment', 'you are not the owner of this comment'),
                ],
            };
        }
        comment.text = text;
        comment.isEdited = true;
        await comment.save();
        return {
            comment,
        };
    }
    async getCommentReplies({ limit, parentId, cursor }) {
        const dateCursor = cursor ? new Date(cursor) : new Date();
        const { comments, errors, hasMore } = await this.getReplies(parentId, dateCursor, limit);
        if (errors && (errors === null || errors === void 0 ? void 0 : errors.length) > 0) {
            return {
                errors,
            };
        }
        return {
            comments,
            hasMore,
        };
    }
    async updootComment({ req }, commentId, value) {
        if (![-1, 1].includes(value)) {
            return {
                errors: [(0, errors_1.CREATE_INVALID_ERROR)('value', 'value must be -1 or 1')],
            };
        }
        const { userId } = req.session;
        const user = await User_1.User.findOne(userId);
        if (!user) {
            return {
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('user')],
            };
        }
        const comment = await Comment_1.Comment.findOne(commentId);
        if (!comment) {
            return {
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('comment')],
            };
        }
        const updoot = await CommentUpdoots_1.CommentUpdoot.findOne({
            where: { commentId, userId },
        });
        if (updoot && updoot.value !== value) {
            const success = await this.updootRepo.updateUpdootValue({
                updoot,
                entity: comment,
                value,
            });
            if (!success) {
                return {
                    errors: [
                        {
                            field: 'user',
                            code: 400,
                            message: 'User has changed his vote more than 5 times in the last 10 minutes',
                        },
                    ],
                };
            }
        }
        else if (!updoot) {
            const result = await this.updootRepo.createUpdoot({
                updootTarget: CommentUpdoots_1.CommentUpdoot,
                entity: comment,
                user,
                value,
                type: 'comment',
            });
            if (!result) {
                return {
                    errors: [errors_1.INTERNAL_SERVER_ERROR],
                };
            }
        }
        return {
            comment,
        };
    }
    async deleteComment(commentId, { req }) {
        const { userId } = req.session;
        const comment = await Comment_1.Comment.findOne(commentId);
        if (!comment) {
            return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('comment')], deleted: false };
        }
        if (comment.userId !== userId) {
            return { errors: [(0, errors_1.CREATE_NOT_AUTHORIZED_ERROR)('user')], deleted: false };
        }
        const post = await MissingPost_1.MissingPost.findOne(comment.postId);
        if (!post) {
            return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('post')], deleted: false };
        }
        post.commentsCount -= 1;
        if (typeof comment.parentId === 'number') {
            const parentComment = await Comment_1.Comment.findOne(comment.parentId);
            if (!parentComment) {
                return {
                    errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('parent comment')],
                    deleted: false,
                };
            }
            parentComment.repliesCount = Math.max(parentComment.repliesCount - 1, 0);
            await (0, typeorm_1.getConnection)().transaction(async (_tm) => {
                await comment.remove();
                await parentComment.save();
                await post.save();
            });
        }
        else if (comment.parentId == null) {
            post.commentsCount = Math.max(post.commentsCount - comment.repliesCount, 0);
            await (0, typeorm_1.getConnection)().transaction(async (_tm) => {
                await (0, typeorm_1.getConnection)().query(`
          delete from comment
          where "parentId" = $1 or id = $1
          --> this sql query will remove all the comments that are connected to the given comment and also the given comment
        `, [comment.id]);
                await post.save();
            });
        }
        return { deleted: true };
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => responseTypes_1.PaginatedComments),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.MissingPostComments]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "comments", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.CommentResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('commentId', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "editComment", null);
__decorate([
    (0, type_graphql_1.Query)(() => responseTypes_1.PaginatedComments),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.ParentCommentReplies]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "getCommentReplies", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.CommentResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('commentId', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "updootComment", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.DeleteResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('commentId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "deleteComment", null);
CommentResolver = __decorate([
    (0, type_graphql_1.Resolver)(Comment_1.Comment),
    __metadata("design:paramtypes", [UpdootRepo_repo_1.UpdootRepo])
], CommentResolver);
exports.CommentResolver = CommentResolver;
//# sourceMappingURL=comment.js.map