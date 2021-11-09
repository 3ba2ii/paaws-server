"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchema = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
const address_1 = __importDefault(require("../resolvers/address"));
const adoption_post_1 = __importDefault(require("../resolvers/adoption-post"));
const comment_1 = require("../resolvers/comment");
const missing_post_1 = __importDefault(require("../resolvers/missing-post"));
const pet_1 = __importDefault(require("../resolvers/pet"));
const photo_1 = __importDefault(require("../resolvers/photo"));
const user_1 = __importDefault(require("../resolvers/user"));
const notification_1 = require("./../resolvers/notification");
let schema;
const createSchema = async () => {
    if (!schema) {
        schema = await (0, type_graphql_1.buildSchema)({
            resolvers: [
                user_1.default,
                pet_1.default,
                photo_1.default,
                adoption_post_1.default,
                address_1.default,
                missing_post_1.default,
                comment_1.CommentResolver,
                notification_1.NotificationResolver,
            ],
            validate: true,
            container: typeorm_typedi_extensions_1.Container,
        });
    }
    return schema;
};
exports.createSchema = createSchema;
//# sourceMappingURL=createSchema.js.map