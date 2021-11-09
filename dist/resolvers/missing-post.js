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
const Comment_1 = require("./../entity/InteractionsEntities/Comment");
const fs_1 = require("fs");
const graphql_upload_1 = require("graphql-upload");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const isAuth_1 = require("../middleware/isAuth");
const PhotoRepo_repo_1 = require("../repos/PhotoRepo.repo");
const UpdootRepo_repo_1 = require("../repos/UpdootRepo.repo");
const inputTypes_1 = require("../types/inputTypes");
const responseTypes_1 = require("../types/responseTypes");
const createBaseResolver_1 = require("../utils/createBaseResolver");
const Address_1 = require("./../entity/Address");
const PostUpdoot_1 = require("./../entity/InteractionsEntities/PostUpdoot");
const Photo_1 = require("./../entity/MediaEntities/Photo");
const PostImages_1 = require("./../entity/MediaEntities/PostImages");
const MissingPost_1 = require("./../entity/PostEntities/MissingPost");
const User_1 = require("./../entity/UserEntities/User");
const errors_1 = require("./../errors");
const AddressRepo_repo_1 = require("./../repos/AddressRepo.repo");
const CommentRepo_repo_1 = require("./../repos/CommentRepo.repo");
const NotificationRepo_repo_1 = require("./../repos/NotificationRepo.repo");
const responseTypes_2 = require("./../types/responseTypes");
const types_1 = require("./../types/types");
const MissingPostBaseResolver = (0, createBaseResolver_1.createBaseResolver)('MissingPost', MissingPost_1.MissingPost);
let MissingPostResolver = class MissingPostResolver extends MissingPostBaseResolver {
    constructor(photoRepo, updootRepo, notificationRepo, addressRepo, commentRepo) {
        super();
        this.photoRepo = photoRepo;
        this.updootRepo = updootRepo;
        this.notificationRepo = notificationRepo;
        this.addressRepo = addressRepo;
        this.commentRepo = commentRepo;
    }
    descriptionSnippet({ description }, length) {
        if (!description)
            return null;
        let snippet = description.substring(0, length || 80);
        if (description.length > snippet.length) {
            snippet += '...';
        }
        return snippet;
    }
    async voteStatus({ id }, { req, dataLoaders: { votingLoader } }) {
        if (!req.session.userId)
            return null;
        const updoot = await votingLoader.load({
            postId: id,
            userId: req.session.userId,
        });
        return updoot ? updoot.value : null;
    }
    async tags({ type }) {
        const tags = [];
        if (type === types_1.MissingPostTypes.Missing) {
            tags.push(types_1.MissingPostTags.Missing);
        }
        else {
            tags.push(types_1.MissingPostTags.Found);
        }
        return tags;
    }
    user({ userId }, { dataLoaders: { userLoader } }) {
        return userLoader.load(userId);
    }
    async address({ addressId }, { dataLoaders: { addressLoader } }) {
        if (!addressId)
            return undefined;
        return addressLoader.load(addressId);
    }
    async images({ id }, { dataLoaders: { postImagesLoader } }) {
        return postImagesLoader.load(id);
    }
    async thumbnail({ thumbnailId }, { dataLoaders: { photoLoader } }) {
        return photoLoader.load(thumbnailId);
    }
    async missingPosts({ limit, cursor }, type) {
        const realLimit = Math.min(20, limit ? limit : 10);
        const realLimitPlusOne = realLimit + 1;
        let posts = (0, typeorm_1.getConnection)()
            .getRepository(MissingPost_1.MissingPost)
            .createQueryBuilder('mp');
        if (type && type !== types_1.MissingPostTypes.ALL)
            posts.andWhere('mp.type = :type', { type });
        if (cursor)
            posts.andWhere('mp."createdAt" < :cursor', {
                cursor: new Date(cursor),
            });
        const results = await posts
            .orderBy('mp."createdAt"', 'DESC')
            .limit(realLimitPlusOne)
            .getMany();
        return {
            missingPosts: results.slice(0, realLimit),
            hasMore: results.length === realLimitPlusOne,
        };
    }
    async createMissingPost({ req }, { address, description, privacy, title, type, thumbnailIdx, }, images) {
        const userId = req.session.userId;
        const user = await User_1.User.findOne(userId);
        if (!user)
            return {
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('user')],
            };
        const missingPost = MissingPost_1.MissingPost.create({
            title,
            description,
            type,
            privacy,
            user,
        });
        if (address) {
            const new_address = await this.addressRepo.createFormattedAddress(Object.assign({}, address));
            if (new_address)
                missingPost.address = new_address;
        }
        const resolvedStreams = await this.photoRepo.getMultipleImagesStreams(images);
        const postImages = resolvedStreams.map(({ filename, uniqueFileName }, idx) => {
            let isThumbnail = false;
            if (typeof thumbnailIdx === 'number' && thumbnailIdx === idx) {
                isThumbnail = true;
            }
            return PostImages_1.PostImages.create({
                photo: Photo_1.Photo.create({
                    filename,
                    path: uniqueFileName,
                    creator: user,
                    isThumbnail,
                }),
                postId: missingPost.id,
            });
        });
        if (typeof thumbnailIdx === 'number')
            missingPost.thumbnail = postImages[thumbnailIdx].photo;
        missingPost.images = postImages;
        const success = await (0, typeorm_1.getConnection)().transaction(async (_) => {
            await Promise.all(resolvedStreams.map((s) => {
                const { stream, pathName } = s;
                return stream.pipe((0, fs_1.createWriteStream)(pathName));
            }));
            await missingPost.save();
            return true;
        });
        if (!success)
            return {
                errors: [errors_1.INTERNAL_SERVER_ERROR],
            };
        if (address && (address === null || address === void 0 ? void 0 : address.lat) && (address === null || address === void 0 ? void 0 : address.lng)) {
            const nearbyUsers = await this.addressRepo.findNearestUsers(address.lat, address.lng, 2);
            nearbyUsers === null || nearbyUsers === void 0 ? void 0 : nearbyUsers.forEach((receiver) => {
                this.notificationRepo.createNotification({
                    performer: user,
                    content: missingPost,
                    receiver,
                    notificationType: types_1.NotificationType.MISSING_PET_AROUND_YOU,
                });
            });
        }
        return { post: missingPost };
    }
    async vote(postId, value, { req }) {
        if (![-1, 1].includes(value))
            return { errors: [(0, errors_1.CREATE_INVALID_ERROR)('value')], success: false };
        const isUpvote = value === 1;
        const { userId } = req.session;
        const post = await MissingPost_1.MissingPost.findOne(postId);
        if (!post)
            return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('post')], success: false };
        const user = await User_1.User.findOne(userId);
        if (!user)
            return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('user')], success: false };
        const updoot = await PostUpdoot_1.PostUpdoot.findOne({ where: { postId, userId } });
        let votingRes;
        if (!updoot) {
            votingRes = await this.updootRepo.createUpdoot({
                updootTarget: PostUpdoot_1.PostUpdoot,
                entity: post,
                user,
                value,
                type: 'post',
            });
        }
        else if (updoot.value !== value) {
            votingRes = await this.updootRepo.updateUpdootValue({
                updoot,
                entity: post,
                value,
            });
        }
        else {
            votingRes = await this.updootRepo.deleteUpdoot(updoot, post);
        }
        if (votingRes.success) {
            this.notificationRepo.createNotification({
                performer: user,
                content: post,
                receiverId: post.userId,
                notificationType: isUpvote
                    ? types_1.NotificationType.UPVOTE
                    : types_1.NotificationType.DOWNVOTE,
            });
        }
        return votingRes;
    }
    async comment(commentInfo, { req }) {
        var _a;
        const isReply = commentInfo.parentId !== null;
        const { userId } = req.session;
        const user = await User_1.User.findOne(userId);
        if (!user)
            return {
                errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('user')],
            };
        const post = await MissingPost_1.MissingPost.findOne(commentInfo.postId);
        if (!post)
            return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('post')] };
        let response;
        let parentComment;
        if (isReply) {
            parentComment = await Comment_1.Comment.findOne(commentInfo.parentId);
            if (!parentComment)
                return { errors: [(0, errors_1.CREATE_NOT_FOUND_ERROR)('comment')] };
            response = await this.commentRepo.reply(commentInfo, parentComment, post, user.id);
        }
        else {
            response = await this.commentRepo.comment(commentInfo, post, user.id);
        }
        if (((_a = response === null || response === void 0 ? void 0 : response.errors) === null || _a === void 0 ? void 0 : _a.length) === 0)
            this.notificationRepo.createNotification({
                performer: user,
                content: post,
                receiverId: post.userId,
                notificationType: types_1.NotificationType.COMMENT_NOTIFICATION,
            });
        parentComment &&
            this.notificationRepo.createNotification({
                performer: user,
                content: post,
                receiverId: parentComment.userId,
                notificationType: types_1.NotificationType.REPLY_NOTIFICATION,
            });
        return response;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Arg)('length', () => type_graphql_1.Int, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost, Number]),
    __metadata("design:returntype", void 0)
], MissingPostResolver.prototype, "descriptionSnippet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "voteStatus", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [types_1.MissingPostTags]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "tags", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Address_1.Address, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "address", null);
__decorate([
    (0, type_graphql_1.FieldResolver)({ nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "images", null);
__decorate([
    (0, type_graphql_1.FieldResolver)({ nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MissingPost_1.MissingPost, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "thumbnail", null);
__decorate([
    (0, type_graphql_1.Query)(() => responseTypes_2.PaginatedMissingPosts),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Arg)('type', () => types_1.MissingPostTypes, {
        nullable: true,
        defaultValue: types_1.MissingPostTypes.ALL,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.PaginationArgs, String]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "missingPosts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.CreateMissingPostResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('input')),
    __param(2, (0, type_graphql_1.Arg)('images', () => [graphql_upload_1.GraphQLUpload])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, inputTypes_1.CreateMissingPostInput, Array]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "createMissingPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.VotingResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.CommentResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.CreateCommentInputType, Object]),
    __metadata("design:returntype", Promise)
], MissingPostResolver.prototype, "comment", null);
MissingPostResolver = __decorate([
    (0, type_graphql_1.Resolver)(MissingPost_1.MissingPost),
    __metadata("design:paramtypes", [PhotoRepo_repo_1.PhotoRepo,
        UpdootRepo_repo_1.UpdootRepo,
        NotificationRepo_repo_1.NotificationRepo,
        AddressRepo_repo_1.AddressRepo,
        CommentRepo_repo_1.CommentRepo])
], MissingPostResolver);
exports.default = MissingPostResolver;
//# sourceMappingURL=missing-post.js.map