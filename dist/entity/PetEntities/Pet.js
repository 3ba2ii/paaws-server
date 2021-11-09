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
exports.Pet = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const types_1 = require("../../types/types");
const class_mixins_1 = require("../../utils/class-mixins");
const Photo_1 = require("../MediaEntities/Photo");
const User_1 = require("../UserEntities/User");
const PetImages_1 = require("./../MediaEntities/PetImages");
const PetBreed_1 = require("./PetBreed");
const PetColors_1 = require("./PetColors");
let Pet = class Pet extends (0, class_mixins_1.EntityWithDates)((0, class_mixins_1.EntityWithBase)(typeorm_1.BaseEntity)) {
};
__decorate([
    (0, type_graphql_1.Field)(() => String),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pet.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetType),
    (0, typeorm_1.Column)({ type: 'enum', enum: types_1.PetType }),
    __metadata("design:type", String)
], Pet.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetGender),
    (0, typeorm_1.Column)({ type: 'enum', enum: types_1.PetGender }),
    __metadata("design:type", String)
], Pet.prototype, "gender", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetSize),
    (0, typeorm_1.Column)({ type: 'enum', enum: types_1.PetSize }),
    __metadata("design:type", String)
], Pet.prototype, "size", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Pet.prototype, "birthDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Pet.prototype, "vaccinated", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Pet.prototype, "spayedOrNeutered", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Pet.prototype, "about", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Pet.prototype, "userId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User),
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.pets, {
        cascade: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", User_1.User)
], Pet.prototype, "user", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PetBreed_1.PetBreed]),
    (0, typeorm_1.OneToMany)(() => PetBreed_1.PetBreed, (pb) => pb.pet, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Pet.prototype, "breeds", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PetColors_1.PetColor]),
    (0, typeorm_1.OneToMany)(() => PetColors_1.PetColor, (pb) => pb.pet, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Pet.prototype, "colors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [PetImages_1.PetImages], { nullable: true }),
    (0, typeorm_1.OneToMany)(() => PetImages_1.PetImages, (petImages) => petImages.pet, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Pet.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Pet.prototype, "thumbnailId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Photo_1.Photo, { nullable: true }),
    (0, typeorm_1.OneToOne)(() => Photo_1.Photo, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Photo_1.Photo)
], Pet.prototype, "thumbnail", void 0);
Pet = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], Pet);
exports.Pet = Pet;
//# sourceMappingURL=Pet.js.map