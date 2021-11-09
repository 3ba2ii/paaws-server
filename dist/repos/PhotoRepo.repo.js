"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoRepo = void 0;
const fs_1 = require("fs");
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const createImage_1 = require("../utils/createImage");
const Photo_1 = require("../entity/MediaEntities/Photo");
let PhotoRepo = class PhotoRepo extends typeorm_1.Repository {
    async getMultipleImagesStreams(images) {
        const streams = images.map(async (image) => {
            const { createReadStream, filename } = await image;
            const { pathName, uniqueFileName } = (0, createImage_1.createImageMetaData)(filename);
            return {
                stream: createReadStream(),
                filename,
                uniqueFileName,
                pathName,
            };
        });
        const resolvedStreams = await Promise.all(streams);
        return resolvedStreams;
    }
    async createPhotoObject({ creator, filename, }) {
        const { pathName, uniqueFileName } = (0, createImage_1.createImageMetaData)(filename);
        const photo = Photo_1.Photo.create({
            creator,
            filename,
            path: uniqueFileName,
        });
        return {
            metadata: {
                photo,
                creator,
                pathName,
                uniqueFileName,
            },
        };
    }
    async saveImageToDisk(metadata, uploadProps) {
        const { createReadStream } = uploadProps;
        if (!createReadStream) {
            return false;
        }
        const { pathName } = metadata;
        const stream = createReadStream();
        await stream.pipe((0, fs_1.createWriteStream)(pathName));
        return true;
    }
    async getAllImages() {
        return Photo_1.Photo.find({});
    }
};
PhotoRepo = __decorate([
    (0, typedi_1.Service)(),
    (0, typeorm_1.EntityRepository)(Photo_1.Photo)
], PhotoRepo);
exports.PhotoRepo = PhotoRepo;
//# sourceMappingURL=PhotoRepo.repo.js.map