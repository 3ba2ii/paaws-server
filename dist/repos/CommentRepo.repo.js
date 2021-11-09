"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepo = void 0;
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const Comment_1 = require("../entity/InteractionsEntities/Comment");
const errors_1 = require("./../errors");
let CommentRepo = class CommentRepo extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.conn = (0, typeorm_1.getConnection)();
    }
    async saveComment(comment, parentComment, post) {
        return this.conn
            .transaction(async (_tm) => {
            await comment.save();
            if (parentComment)
                await parentComment.save();
            if (post)
                await post.save();
        })
            .then(() => {
            return { comment };
        })
            .catch(() => ({ errors: [errors_1.INTERNAL_SERVER_ERROR] }));
    }
    async updateAndSave(newComment, parentComment, post) {
        post.commentsCount += 1;
        if (parentComment)
            parentComment.repliesCount += 1;
        return this.saveComment(newComment, parentComment, post);
    }
    async reply(commentInfo, parentComment, post, userId) {
        const grandParentId = parentComment.parentId;
        if (!grandParentId) {
            const reply = Comment_1.Comment.create(Object.assign(Object.assign({}, commentInfo), { userId }));
            return this.updateAndSave(reply, parentComment, post);
        }
        else {
            const grandParentComment = await Comment_1.Comment.findOne(grandParentId);
            if (!grandParentComment)
                return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('comment')] };
            if (grandParentComment.postId !== post.id)
                return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('post')] };
            const reply = Comment_1.Comment.create(Object.assign(Object.assign({}, commentInfo), { parentId: grandParentComment.id, userId }));
            return this.updateAndSave(reply, grandParentComment, post);
        }
    }
    async comment(commentInfo, post, userId) {
        const comment = Comment_1.Comment.create(Object.assign(Object.assign({}, commentInfo), { userId }));
        return this.updateAndSave(comment, null, post);
    }
};
CommentRepo = __decorate([
    (0, typedi_1.Service)(),
    (0, typeorm_1.EntityRepository)(Comment_1.Comment)
], CommentRepo);
exports.CommentRepo = CommentRepo;
//# sourceMappingURL=CommentRepo.repo.js.map