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
exports.Post = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const class_mixins_1 = require("../../utils/class-mixins");
const Pet_1 = require("../PetEntities/Pet");
let Post = class Post extends (0, class_mixins_1.EntityWithDates)((0, class_mixins_1.EntityWithLocation)((0, class_mixins_1.EntityWithBase)(typeorm_1.BaseEntity))) {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Post.prototype, "petId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Pet_1.Pet),
    (0, typeorm_1.OneToOne)(() => Pet_1.Pet, { cascade: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Pet_1.Pet)
], Post.prototype, "pet", void 0);
Post = __decorate([
    (0, type_graphql_1.ObjectType)()
], Post);
exports.Post = Post;
//# sourceMappingURL=Post.js.map