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
exports.PetImages = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Pet_1 = require("../PetEntities/Pet");
const Photo_1 = require("./Photo");
let PetImages = class PetImages extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], PetImages.prototype, "petId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Pet_1.Pet),
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, (pet) => pet.images, { onDelete: 'CASCADE' }),
    __metadata("design:type", Pet_1.Pet)
], PetImages.prototype, "pet", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], PetImages.prototype, "photoId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Photo_1.Photo),
    (0, typeorm_1.OneToOne)(() => Photo_1.Photo, { cascade: true, eager: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Photo_1.Photo)
], PetImages.prototype, "photo", void 0);
PetImages = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], PetImages);
exports.PetImages = PetImages;
//# sourceMappingURL=PetImages.js.map