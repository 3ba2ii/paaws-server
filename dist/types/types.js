"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingPostTags = exports.NOTIFICATION_CONTENT_TYPES = exports.NotificationType = exports.MissingPostTypes = exports.PrivacyType = exports.UserTagsType = exports.PetColors = exports.Breeds = exports.PetSize = exports.PetGender = exports.PetType = exports.PetStatus = void 0;
const type_graphql_1 = require("type-graphql");
var PetStatus;
(function (PetStatus) {
    PetStatus["OFFERED"] = "offered";
    PetStatus["ADOPTED"] = "adopted";
    PetStatus["DELETED"] = "deleted";
})(PetStatus = exports.PetStatus || (exports.PetStatus = {}));
var PetType;
(function (PetType) {
    PetType["DOG"] = "dog";
    PetType["CAT"] = "cat";
    PetType["RABBIT"] = "rabbit";
})(PetType = exports.PetType || (exports.PetType = {}));
var PetGender;
(function (PetGender) {
    PetGender["MALE"] = "male";
    PetGender["FEMALE"] = "female";
    PetGender["OTHER"] = "other";
})(PetGender = exports.PetGender || (exports.PetGender = {}));
var PetSize;
(function (PetSize) {
    PetSize["SMALL"] = "sm";
    PetSize["MEDIUM"] = "md";
    PetSize["LARGE"] = "lg";
})(PetSize = exports.PetSize || (exports.PetSize = {}));
var Breeds;
(function (Breeds) {
    Breeds["BULLDOG"] = "bulldog";
    Breeds["HUSKEY"] = "huskey";
})(Breeds = exports.Breeds || (exports.Breeds = {}));
var PetColors;
(function (PetColors) {
    PetColors["RED"] = "red";
    PetColors["BLUE"] = "blue";
    PetColors["GREEN"] = "green";
})(PetColors = exports.PetColors || (exports.PetColors = {}));
var UserTagsType;
(function (UserTagsType) {
    UserTagsType["CAT_PERSON"] = "Cat Person";
    UserTagsType["DOG_PERSON"] = "Dog Person";
    UserTagsType["ADOPTER"] = "Adopter";
    UserTagsType["ANIMAL_FRIEND"] = "Animal Friend";
    UserTagsType["ANIMAL_PARTNER"] = "Animal Partner";
    UserTagsType["ANIMAL_OWNER"] = "Animal Owner";
    UserTagsType["ANIMAL_OWNER_ADOPTER"] = "Animal Owner & Adopter";
})(UserTagsType = exports.UserTagsType || (exports.UserTagsType = {}));
var PrivacyType;
(function (PrivacyType) {
    PrivacyType["PUBLIC"] = "public";
    PrivacyType["PRIVATE"] = "private";
    PrivacyType["ONLY_ME"] = "only_me";
})(PrivacyType = exports.PrivacyType || (exports.PrivacyType = {}));
var MissingPostTypes;
(function (MissingPostTypes) {
    MissingPostTypes["Missing"] = "missing";
    MissingPostTypes["Found"] = "found";
    MissingPostTypes["Rescued"] = "rescued";
    MissingPostTypes["ALL"] = "All";
})(MissingPostTypes = exports.MissingPostTypes || (exports.MissingPostTypes = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["UPVOTE"] = "UPVOTE";
    NotificationType["DOWNVOTE"] = "DOWNVOTE";
    NotificationType["COMMENT_NOTIFICATION"] = "COMMENT_NOTIFICATION";
    NotificationType["REPLY_NOTIFICATION"] = "REPLY_NOTIFICATION";
    NotificationType["MISSING_PET_AROUND_YOU"] = "MISSING_PET_AROUND_YOU";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
var NOTIFICATION_CONTENT_TYPES;
(function (NOTIFICATION_CONTENT_TYPES) {
    NOTIFICATION_CONTENT_TYPES["POST"] = "POST";
    NOTIFICATION_CONTENT_TYPES["COMMENT"] = "COMMENT";
    NOTIFICATION_CONTENT_TYPES["USER"] = "USER";
})(NOTIFICATION_CONTENT_TYPES = exports.NOTIFICATION_CONTENT_TYPES || (exports.NOTIFICATION_CONTENT_TYPES = {}));
var MissingPostTags;
(function (MissingPostTags) {
    MissingPostTags["Missing"] = "missing";
    MissingPostTags["Found"] = "found";
    MissingPostTags["Rescued"] = "rescued";
    MissingPostTags["NearYou"] = "near-you";
    MissingPostTags["Urgent"] = "urgent";
})(MissingPostTags = exports.MissingPostTags || (exports.MissingPostTags = {}));
(0, type_graphql_1.registerEnumType)(MissingPostTags, {
    name: 'MissingPostTags',
    description: 'Missing Post Tags',
});
(0, type_graphql_1.registerEnumType)(NOTIFICATION_CONTENT_TYPES, {
    name: 'NOTIFICATION_CONTENT_TYPES',
});
(0, type_graphql_1.registerEnumType)(NotificationType, {
    name: 'NotificationType',
    description: 'Upvote or downvote a post or Comment',
});
(0, type_graphql_1.registerEnumType)(MissingPostTypes, {
    name: 'MissingPostTypes',
    description: 'Either missing, found, rescued, or all',
});
(0, type_graphql_1.registerEnumType)(PrivacyType, {
    name: 'PrivacyType',
    description: 'Post Privacy',
});
(0, type_graphql_1.registerEnumType)(UserTagsType, {
    name: 'UserTagsType',
    description: 'User Tags Option',
});
(0, type_graphql_1.registerEnumType)(Breeds, {
    name: 'Breeds',
    description: 'Basic Pet Breeds',
});
(0, type_graphql_1.registerEnumType)(PetStatus, {
    name: 'PetStatus',
    description: 'Basic Pet Status',
});
(0, type_graphql_1.registerEnumType)(PetType, {
    name: 'PetType',
    description: 'Basic Pet Type',
});
(0, type_graphql_1.registerEnumType)(PetGender, {
    name: 'PetGender',
    description: 'Basic Pet Gender',
});
(0, type_graphql_1.registerEnumType)(PetSize, {
    name: 'PetSize',
    description: 'Basic Pet Size',
});
(0, type_graphql_1.registerEnumType)(PetColors, {
    name: 'PetColors',
    description: 'Basic Pet Colors',
});
//# sourceMappingURL=types.js.map