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
exports.PetBreed = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const types_1 = require("../../types/types");
const Pet_1 = require("./Pet");
let PetBreed = class PetBreed extends typeorm_1.BaseEntity {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], PetBreed.prototype, "petId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Pet_1.Pet),
    (0, typeorm_1.ManyToOne)(() => Pet_1.Pet, (user) => user.breeds, {
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
    }),
    __metadata("design:type", Pet_1.Pet)
], PetBreed.prototype, "pet", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.Breeds),
    (0, typeorm_1.PrimaryColumn)({ type: 'enum', enum: types_1.Breeds, enumName: 'Breeds' }),
    __metadata("design:type", String)
], PetBreed.prototype, "breed", void 0);
PetBreed = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], PetBreed);
exports.PetBreed = PetBreed;
//# sourceMappingURL=PetBreed.js.map