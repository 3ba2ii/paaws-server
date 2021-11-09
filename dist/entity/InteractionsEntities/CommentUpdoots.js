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
exports.CommentUpdoot = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Comment_1 = require("./Comment");
const Updoot_1 = require("./Updoot");
let CommentUpdoot = class CommentUpdoot extends Updoot_1.Updoot {
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], CommentUpdoot.prototype, "commentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Comment_1.Comment, (comment) => comment.updoots, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Comment_1.Comment)
], CommentUpdoot.prototype, "comment", void 0);
CommentUpdoot = __decorate([
    (0, type_graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)()
], CommentUpdoot);
exports.CommentUpdoot = CommentUpdoot;
//# sourceMappingURL=CommentUpdoots.js.map