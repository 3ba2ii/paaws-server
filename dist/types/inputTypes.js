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
exports.ParentCommentReplies = exports.MissingPostComments = exports.PaginationArgs = exports.CreateCommentInputType = exports.FindNearestUsersInput = exports.WhereClause = exports.UpdateUserInfo = exports.CreateMissingPostInput = exports.AdoptionPetsFilters = exports.AdoptionPostUpdateInput = exports.AdoptionPostInput = exports.AddressInput = exports.ChangePasswordInput = exports.CreatePetOptions = exports.LoginInput = exports.RegisterOptions = void 0;
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
const IsNotBlank_1 = require("../utils/CustomClassValidators/IsNotBlank");
const types_1 = require("./types");
let RegisterOptions = class RegisterOptions {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RegisterOptions.prototype, "full_name", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], RegisterOptions.prototype, "phone", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterOptions.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(8, 40),
    __metadata("design:type", String)
], RegisterOptions.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], RegisterOptions.prototype, "otp", void 0);
RegisterOptions = __decorate([
    (0, type_graphql_1.InputType)()
], RegisterOptions);
exports.RegisterOptions = RegisterOptions;
let LoginInput = class LoginInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "identifier", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], LoginInput.prototype, "password", void 0);
LoginInput = __decorate([
    (0, type_graphql_1.InputType)()
], LoginInput);
exports.LoginInput = LoginInput;
let CreatePetOptions = class CreatePetOptions {
};
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePetOptions.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetType),
    __metadata("design:type", String)
], CreatePetOptions.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetGender),
    __metadata("design:type", String)
], CreatePetOptions.prototype, "gender", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetSize),
    __metadata("design:type", String)
], CreatePetOptions.prototype, "size", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CreatePetOptions.prototype, "birthDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, {
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], CreatePetOptions.prototype, "vaccinated", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, {
        defaultValue: false,
    }),
    __metadata("design:type", Boolean)
], CreatePetOptions.prototype, "spayedOrNeutered", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePetOptions.prototype, "about", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.Breeds]),
    __metadata("design:type", Array)
], CreatePetOptions.prototype, "breeds", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], CreatePetOptions.prototype, "thumbnailIdx", void 0);
CreatePetOptions = __decorate([
    (0, type_graphql_1.InputType)()
], CreatePetOptions);
exports.CreatePetOptions = CreatePetOptions;
let ChangePasswordInput = class ChangePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "token", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ChangePasswordInput.prototype, "confirmPassword", void 0);
ChangePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], ChangePasswordInput);
exports.ChangePasswordInput = ChangePasswordInput;
let AddressInput = class AddressInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AddressInput.prototype, "street", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AddressInput.prototype, "city", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AddressInput.prototype, "state", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AddressInput.prototype, "zip", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AddressInput.prototype, "country", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], AddressInput.prototype, "lat", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], AddressInput.prototype, "lng", void 0);
AddressInput = __decorate([
    (0, type_graphql_1.InputType)()
], AddressInput);
exports.AddressInput = AddressInput;
let AdoptionPostInput = class AdoptionPostInput {
};
__decorate([
    (0, type_graphql_1.Field)(() => CreatePetOptions),
    __metadata("design:type", CreatePetOptions)
], AdoptionPostInput.prototype, "petInfo", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => AddressInput, { nullable: true }),
    __metadata("design:type", AddressInput)
], AdoptionPostInput.prototype, "address", void 0);
AdoptionPostInput = __decorate([
    (0, type_graphql_1.InputType)()
], AdoptionPostInput);
exports.AdoptionPostInput = AdoptionPostInput;
let AdoptionPostUpdateInput = class AdoptionPostUpdateInput {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdoptionPostUpdateInput.prototype, "name", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetType, { nullable: true }),
    __metadata("design:type", String)
], AdoptionPostUpdateInput.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetGender, { nullable: true }),
    __metadata("design:type", String)
], AdoptionPostUpdateInput.prototype, "gender", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PetSize, { nullable: true }),
    __metadata("design:type", String)
], AdoptionPostUpdateInput.prototype, "size", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], AdoptionPostUpdateInput.prototype, "birthDate", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], AdoptionPostUpdateInput.prototype, "vaccinated", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], AdoptionPostUpdateInput.prototype, "spayedOrNeutered", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AdoptionPostUpdateInput.prototype, "about", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.Breeds], { nullable: true }),
    __metadata("design:type", Array)
], AdoptionPostUpdateInput.prototype, "breeds", void 0);
AdoptionPostUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], AdoptionPostUpdateInput);
exports.AdoptionPostUpdateInput = AdoptionPostUpdateInput;
let AdoptionPetsFilters = class AdoptionPetsFilters {
};
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.PetType], { nullable: true, defaultValue: [] }),
    __metadata("design:type", Array)
], AdoptionPetsFilters.prototype, "petTypes", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.PetGender], { nullable: true, defaultValue: [] }),
    __metadata("design:type", Array)
], AdoptionPetsFilters.prototype, "petGenders", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [types_1.PetSize], { nullable: true, defaultValue: [] }),
    __metadata("design:type", Array)
], AdoptionPetsFilters.prototype, "petSizes", void 0);
AdoptionPetsFilters = __decorate([
    (0, type_graphql_1.InputType)()
], AdoptionPetsFilters);
exports.AdoptionPetsFilters = AdoptionPetsFilters;
let CreateMissingPostInput = class CreateMissingPostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMissingPostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateMissingPostInput.prototype, "description", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.MissingPostTypes),
    __metadata("design:type", String)
], CreateMissingPostInput.prototype, "type", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => types_1.PrivacyType),
    __metadata("design:type", String)
], CreateMissingPostInput.prototype, "privacy", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => AddressInput, { nullable: true }),
    __metadata("design:type", AddressInput)
], CreateMissingPostInput.prototype, "address", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    __metadata("design:type", Number)
], CreateMissingPostInput.prototype, "thumbnailIdx", void 0);
CreateMissingPostInput = __decorate([
    (0, type_graphql_1.InputType)()
], CreateMissingPostInput);
exports.CreateMissingPostInput = CreateMissingPostInput;
let UpdateUserInfo = class UpdateUserInfo {
};
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInfo.prototype, "bio", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateUserInfo.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.Max)(80),
    (0, class_validator_1.Min)(-180),
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], UpdateUserInfo.prototype, "lng", void 0);
__decorate([
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.Min)(-90),
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], UpdateUserInfo.prototype, "lat", void 0);
UpdateUserInfo = __decorate([
    (0, type_graphql_1.InputType)()
], UpdateUserInfo);
exports.UpdateUserInfo = UpdateUserInfo;
let WhereClause = class WhereClause {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], WhereClause.prototype, "limit", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], WhereClause.prototype, "cursor", void 0);
WhereClause = __decorate([
    (0, type_graphql_1.InputType)()
], WhereClause);
exports.WhereClause = WhereClause;
let FindNearestUsersInput = class FindNearestUsersInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], FindNearestUsersInput.prototype, "lat", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], FindNearestUsersInput.prototype, "lng", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], FindNearestUsersInput.prototype, "radius", void 0);
FindNearestUsersInput = __decorate([
    (0, type_graphql_1.InputType)()
], FindNearestUsersInput);
exports.FindNearestUsersInput = FindNearestUsersInput;
let CreateCommentInputType = class CreateCommentInputType {
};
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Please provide a valid comment text' }),
    (0, IsNotBlank_1.IsNotBlank)('text', { message: 'Please provide a valid comment text' }),
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], CreateCommentInputType.prototype, "text", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    __metadata("design:type", Number)
], CreateCommentInputType.prototype, "postId", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, {
        nullable: true,
        description: 'parentId refers to the parent comment id in case of replying',
    }),
    __metadata("design:type", Number)
], CreateCommentInputType.prototype, "parentId", void 0);
CreateCommentInputType = __decorate([
    (0, type_graphql_1.InputType)()
], CreateCommentInputType);
exports.CreateCommentInputType = CreateCommentInputType;
let PaginationArgs = class PaginationArgs {
    constructor() {
        this.limit = 10;
    }
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true, defaultValue: 10 }),
    __metadata("design:type", Number)
], PaginationArgs.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, type_graphql_1.Field)({ nullable: true, description: 'Date must be ISO8601 Format' }),
    __metadata("design:type", String)
], PaginationArgs.prototype, "cursor", void 0);
PaginationArgs = __decorate([
    (0, type_graphql_1.InputType)()
], PaginationArgs);
exports.PaginationArgs = PaginationArgs;
let MissingPostComments = class MissingPostComments extends PaginationArgs {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MissingPostComments.prototype, "postId", void 0);
MissingPostComments = __decorate([
    (0, type_graphql_1.InputType)()
], MissingPostComments);
exports.MissingPostComments = MissingPostComments;
let ParentCommentReplies = class ParentCommentReplies extends PaginationArgs {
};
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], ParentCommentReplies.prototype, "parentId", void 0);
ParentCommentReplies = __decorate([
    (0, type_graphql_1.InputType)()
], ParentCommentReplies);
exports.ParentCommentReplies = ParentCommentReplies;
//# sourceMappingURL=inputTypes.js.map