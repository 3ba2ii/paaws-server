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
const type_graphql_1 = require("type-graphql");
const Photo_1 = require("../entity/MediaEntities/Photo");
const Pet_1 = require("../entity/PetEntities/Pet");
const PetBreed_1 = require("../entity/PetEntities/PetBreed");
const User_1 = require("../entity/UserEntities/User");
const isAuth_1 = require("../middleware/isAuth");
const responseTypes_1 = require("../types/responseTypes");
const createBaseResolver_1 = require("../utils/createBaseResolver");
const inputTypes_1 = require("./../types/inputTypes");
const PetBaseResolver = (0, createBaseResolver_1.createBaseResolver)('Pet', Pet_1.Pet);
let PetResolver = class PetResolver extends PetBaseResolver {
    async thumbnail({ thumbnailId }) {
        if (!thumbnailId)
            return undefined;
        return Photo_1.Photo.findOne(thumbnailId);
    }
    images(pet, { dataLoaders: { petImagesLoader } }) {
        return petImagesLoader.load(pet.id);
    }
    user(pet, { dataLoaders: { userLoader } }) {
        return userLoader.load(pet.userId);
    }
    async pets() {
        return Pet_1.Pet.find();
    }
    async pet(petId) {
        return Pet_1.Pet.findOne(petId);
    }
    async createPet(createPetOptions, { req }) {
        const { breeds } = createPetOptions;
        const userId = req.session.userId;
        const user = await User_1.User.findOne(userId);
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
        const pet = Pet_1.Pet.create(Object.assign(Object.assign({}, createPetOptions), { breeds: breeds.map((breed) => PetBreed_1.PetBreed.create({ breed })), user }));
        await pet.save();
        return { pet };
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)({ nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Pet_1.Pet]),
    __metadata("design:returntype", Promise)
], PetResolver.prototype, "thumbnail", null);
__decorate([
    (0, type_graphql_1.FieldResolver)({ nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Pet_1.Pet, Object]),
    __metadata("design:returntype", Promise)
], PetResolver.prototype, "images", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Pet_1.Pet, Object]),
    __metadata("design:returntype", Promise)
], PetResolver.prototype, "user", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Pet_1.Pet]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PetResolver.prototype, "pets", null);
__decorate([
    (0, type_graphql_1.Query)(() => Pet_1.Pet, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('petId', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PetResolver.prototype, "pet", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => responseTypes_1.PetResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('createPetOptions')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inputTypes_1.CreatePetOptions, Object]),
    __metadata("design:returntype", Promise)
], PetResolver.prototype, "createPet", null);
PetResolver = __decorate([
    (0, type_graphql_1.Resolver)(Pet_1.Pet)
], PetResolver);
exports.default = PetResolver;
//# sourceMappingURL=pet.js.map