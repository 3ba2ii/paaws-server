"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostImageLoader = exports.createPetImagesLoader = exports.createVoteStatusLoader = exports.createPhotoLoader = exports.createAddressLoader = exports.createPetLoader = exports.createUserLoader = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const Pet_1 = require("../entity/PetEntities/Pet");
const User_1 = require("../entity/UserEntities/User");
const Address_1 = require("./../entity/Address");
const PostUpdoot_1 = require("./../entity/InteractionsEntities/PostUpdoot");
const PetImages_1 = require("./../entity/MediaEntities/PetImages");
const Photo_1 = require("./../entity/MediaEntities/Photo");
const PostImages_1 = require("./../entity/MediaEntities/PostImages");
const loadMappedData_1 = require("./loadMappedData");
const createUserLoader = () => {
    return new dataloader_1.default((userIds) => {
        return (0, loadMappedData_1.loadMappedData)(User_1.User, userIds);
    });
};
exports.createUserLoader = createUserLoader;
const createPetLoader = () => {
    return new dataloader_1.default(async (petIds) => {
        return (0, loadMappedData_1.loadMappedData)(Pet_1.Pet, petIds);
    });
};
exports.createPetLoader = createPetLoader;
const createAddressLoader = () => {
    return new dataloader_1.default(async (addressIds) => {
        return (0, loadMappedData_1.loadMappedData)(Address_1.Address, addressIds);
    });
};
exports.createAddressLoader = createAddressLoader;
const createPhotoLoader = () => {
    return new dataloader_1.default(async (photoIds) => {
        return (0, loadMappedData_1.loadMappedData)(Photo_1.Photo, photoIds);
    });
};
exports.createPhotoLoader = createPhotoLoader;
const createVoteStatusLoader = () => {
    return new dataloader_1.default(async (keys) => {
        const updoots = await PostUpdoot_1.PostUpdoot.findByIds(keys);
        const updootIdsToUsers = {};
        updoots.forEach((updoot) => {
            updootIdsToUsers[`${updoot.userId}|${updoot.postId}`] = updoot;
        });
        return keys.map((key) => updootIdsToUsers[`${key.userId}|${key.postId}`]);
    });
};
exports.createVoteStatusLoader = createVoteStatusLoader;
const createPetImagesLoader = () => {
    return new dataloader_1.default(async (petIds) => {
        const data = await (0, loadMappedData_1.createOneToManyLoader)(PetImages_1.PetImages, petIds, 'petId');
        return data;
    });
};
exports.createPetImagesLoader = createPetImagesLoader;
const createPostImageLoader = () => {
    return new dataloader_1.default(async (postIds) => {
        const data = await (0, loadMappedData_1.createOneToManyLoader)(PostImages_1.PostImages, postIds, 'postId');
        return data;
    });
};
exports.createPostImageLoader = createPostImageLoader;
//# sourceMappingURL=dataLoaders.js.map