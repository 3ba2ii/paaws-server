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
exports.EmptyClass = exports.EntityWithLocation = exports.EntityWithDates = exports.EntityWithBase = void 0;
const Address_1 = require("../entity/Address");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
function EntityWithBase(Base) {
    let AbstractBase = class AbstractBase extends Base {
    };
    __decorate([
        (0, type_graphql_1.Field)(() => type_graphql_1.Int),
        (0, typeorm_1.PrimaryGeneratedColumn)(),
        __metadata("design:type", Number)
    ], AbstractBase.prototype, "id", void 0);
    AbstractBase = __decorate([
        (0, type_graphql_1.ObjectType)()
    ], AbstractBase);
    return AbstractBase;
}
exports.EntityWithBase = EntityWithBase;
function EntityWithDates(Base) {
    let AbstractBase = class AbstractBase extends Base {
    };
    __decorate([
        (0, type_graphql_1.Field)(),
        (0, typeorm_1.UpdateDateColumn)(),
        __metadata("design:type", Date)
    ], AbstractBase.prototype, "updatedAt", void 0);
    __decorate([
        (0, type_graphql_1.Field)(),
        (0, typeorm_1.CreateDateColumn)(),
        __metadata("design:type", Date)
    ], AbstractBase.prototype, "createdAt", void 0);
    AbstractBase = __decorate([
        (0, type_graphql_1.ObjectType)()
    ], AbstractBase);
    return AbstractBase;
}
exports.EntityWithDates = EntityWithDates;
function EntityWithLocation(Base) {
    let AbstractBase = class AbstractBase extends Base {
    };
    __decorate([
        (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
        (0, typeorm_1.Column)({ nullable: true }),
        __metadata("design:type", Number)
    ], AbstractBase.prototype, "addressId", void 0);
    __decorate([
        (0, type_graphql_1.Field)(() => Address_1.Address, { nullable: true }),
        (0, typeorm_1.OneToOne)(() => Address_1.Address, {
            nullable: true,
            cascade: true,
            onDelete: 'CASCADE',
        }),
        (0, typeorm_1.JoinColumn)({ name: 'addressId' }),
        __metadata("design:type", Address_1.Address)
    ], AbstractBase.prototype, "address", void 0);
    AbstractBase = __decorate([
        (0, type_graphql_1.ObjectType)()
    ], AbstractBase);
    return AbstractBase;
}
exports.EntityWithLocation = EntityWithLocation;
class EmptyClass {
}
exports.EmptyClass = EmptyClass;
//# sourceMappingURL=class-mixins.js.map