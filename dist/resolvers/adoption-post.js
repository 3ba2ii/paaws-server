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
const fs_1 = require("fs");
const graphql_upload_1 = require("graphql-upload");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Address_1 = require("../entity/Address");
const PetImages_1 = require("../entity/MediaEntities/PetImages");
const Photo_1 = require("../entity/MediaEntities/Photo");
const Pet_1 = require("../entity/PetEntities/Pet");
const PetBreed_1 = require("../entity/PetEntities/PetBreed");
const AdoptionPost_1 = require("../entity/PostEntities/AdoptionPost");
const User_1 = require("../entity/UserEntities/User");
const errors_1 = require("../errors");
const isAuth_1 = require("../middleware/isAuth");
const PhotoRepo_repo_1 = require("../repos/PhotoRepo.repo");
const inputTypes_1 = require("../types/inputTypes");
const responseTypes_1 = require("../types/responseTypes");
const createBaseResolver_1 = require("../utils/createBaseResolver");
const errors_2 = require("./../errors");
const Pet_repo_1 = require("./../repos/Pet.repo");
const AdoptionPostBaseResolver = (0, createBaseResolver_1.createBaseResolver)('AdoptionPost', AdoptionPost_1.AdoptionPost);
let AdoptionPostResolver = class AdoptionPostResolver extends AdoptionPostBaseResolver {
    constructor(photoRepo, petRepo) {
        super();
        this.photoRepo = photoRepo;
        this.petRepo = petRepo;
    }
    user({ userId }, { dataLoaders: { userLoader } }) {
        return userLoader.load(userId);
    }
    pet({ petId }, { dataLoaders: { petLoader } }) {
        return petLoader.load(petId);
    }
    async address({ addressId }, { dataLoaders: { addressLoader } }) {
        if (!addressId)
            return null;
        return addressLoader.load(addressId);
    }
    async adoptionPosts(limit, cursor, filters) {
        const realLimit = Math.min(20, limit);
        const realLimitPlusOne = realLimit + 1;
        const { petGenders, petSizes, petTypes } = filters || {
            petGenders: [],
            petSizes: [],
            petTypes: [],
        };
        let posts = (0, typeorm_1.getConnection)()
            .getRepository(AdoptionPost_1.AdoptionPost)
            .createQueryBuilder('ap')
            .leftJoinAndSelect(`ap.pet`, `pet`);
        if (cursor)
            posts.where('ap."createdAt" < :cursor', {
                cursor: new Date(cursor),
            });
        posts
            .andWhere((qb) => {
            const subQuery = qb.subQuery().select('pet.id').from(Pet_1.Pet, 'pet');
            if (petTypes === null || petTypes === void 0 ? void 0 : petTypes.length) {
                subQuery.where('pet.type IN (:...petTypes)', {
                    petTypes,
                });
            }
            if (petGenders === null || petGenders === void 0 ? void 0 : petGenders.length) {
                subQuery.andWhere('pet.gender IN (:...petGenders)', {
                    petGenders,
                });
            }
            if (petSizes === null || petSizes === void 0 ? void 0 : petSizes.length) {
                subQuery.andWhere('pet.size IN (:...petSizes)', {
                    petSizes,
                });
            }
            return `ap.petId IN (${subQuery.getQuery()})`;
        })
            .orderBy('ap."createdAt"', 'DESC')
            .limit(realLimitPlusOne);
        const adoptionPosts = await posts.getMany();
        return {
            hasMore: adoptionPosts.length === realLimitPlusOne,
            posts: adoptionPosts.slice(0, realLimit),
        };
    }
    adoptionPost(id) {
        return AdoptionPost_1.AdoptionPost.findOne(id);
    }
    async createAdoptionPost(input, images, { req }) {
        const user = await User_1.User.findOne(req.session.userId);
        if (!user)
            return {
                errors: [
                    {
                        field: 'user',
                        code: 404,
                        message: 'User not found',
                    },
                ],
            };
        const { petInfo, address: inputAddress } = input;
        const { breeds, thumbnailIdx } = petInfo;
        const resolvedStreams = await this.photoRepo.getMultipleImagesStreams(images);
        const pet = Pet_1.Pet.create(Object.assign(Object.assign({}, petInfo), { breeds: breeds.map((breed) => PetBreed_1.PetBreed.create({ breed })), user }));
        const petImages = resolvedStreams.map(({ filename, uniqueFileName }, idx) => {
            let isThumbnail = false;
            if (thumbnailIdx && thumbnailIdx === idx) {
                isThumbnail = true;
            }
            return PetImages_1.PetImages.create({
                photo: Photo_1.Photo.create({
                    filename,
                    path: uniqueFileName,
                    creator: user,
                    isThumbnail,
                }),
            });
        });
        pet.images = petImages;
        if (typeof thumbnailIdx === 'number')
            pet.thumbnail = petImages[thumbnailIdx].photo;
        const adoptionPost = AdoptionPost_1.AdoptionPost.create({
            pet,
            user,
        });
        if (inputAddress) {
            const address = Address_1.Address.create(Object.assign({}, inputAddress));
            adoptionPost.address = address;
        }
        const success = await (0, typeorm_1.getConnection)().transaction(async (_) => {
            await adoptionPost.save();
            await Promise.all(resolvedStreams.map((s) => {
                const { stream, pathName } = s;
                return stream.pipe((0, fs_1.createWriteStream)(pathName));
            }));
            return true;
        });
        if (!success)
            return {
                errors: [
                    { code: 500, message: 'Internal Server Error', field: 'server' },
                ],
            };
        return { adoptionPost };
    }
    async updateAdoptionPost(id, newPetInfo, { req }) {
        const post = await AdoptionPost_1.AdoptionPost.findOne(id);
        if (!post)
            return {
                errors: [(0, errors_2.CREATE_NOT_FOUND_ERROR)('post')],
            };
        if (post.userId !== req.session.userId)
            return {
                errors: [(0, errors_1.CREATE_NOT_AUTHORIZED_ERROR)('user')],
            };
        const { errors } = await this.petRepo.updatePetInfo(newPetInfo, post.petId);
        if (errors === null || errors === void 0 ? void 0 : errors.length)
            return {
                errors,
            };
        return {
            adoptionPost: post,
        };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdoptionPost_1.AdoptionPost, Object]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Pet_1.Pet),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdoptionPost_1.AdoptionPost, Object]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "pet", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Address_1.Address, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdoptionPost_1.AdoptionPost, Object]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "address", null);
__decorate([
    (0, type_graphql_1.Query)(() => responseTypes_1.PaginatedAdoptionPosts),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int, { nullable: true, defaultValue: 20 })),
    __param(1, (0, type_graphql_1.Arg)('cursor', { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)('filters', () => inputTypes_1.AdoptionPetsFilters, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, inputTypes_1.AdoptionPetsFilters]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "adoptionPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => AdoptionPost_1.AdoptionPost, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "adoptionPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.AdoptionPostResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Arg)('images', () => [graphql_upload_1.GraphQLUpload])),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.AdoptionPostInput, Array, Object]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "createAdoptionPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.AdoptionPostResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('newPetInfo', () => inputTypes_1.AdoptionPostUpdateInput)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, inputTypes_1.AdoptionPostUpdateInput, Object]),
    __metadata("design:returntype", Promise)
], AdoptionPostResolver.prototype, "updateAdoptionPost", null);
AdoptionPostResolver = __decorate([
    (0, type_graphql_1.Resolver)(AdoptionPost_1.AdoptionPost),
    __metadata("design:paramtypes", [PhotoRepo_repo_1.PhotoRepo,
        Pet_repo_1.PetRepo])
], AdoptionPostResolver);
exports.default = AdoptionPostResolver;
//# sourceMappingURL=adoption-post.js.map