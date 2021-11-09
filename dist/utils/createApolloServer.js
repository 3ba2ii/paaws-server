"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApolloServer = void 0;
const dataLoaders_1 = require("./dataLoaders");
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const createSchema_1 = require("./createSchema");
const createApolloServer = async (redis) => {
    return new apollo_server_express_1.ApolloServer({
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            dataLoaders: {
                petLoader: (0, dataLoaders_1.createPetLoader)(),
                userLoader: (0, dataLoaders_1.createUserLoader)(),
                addressLoader: (0, dataLoaders_1.createAddressLoader)(),
                petImagesLoader: (0, dataLoaders_1.createPetImagesLoader)(),
                postImagesLoader: (0, dataLoaders_1.createPostImageLoader)(),
                photoLoader: (0, dataLoaders_1.createPhotoLoader)(),
                votingLoader: (0, dataLoaders_1.createVoteStatusLoader)(),
            },
        }),
        schema: await (0, createSchema_1.createSchema)(),
        plugins: [
            (0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)({
                settings: {
                    'request.credentials': 'include',
                },
            }),
        ],
    });
};
exports.createApolloServer = createApolloServer;
//# sourceMappingURL=createApolloServer.js.map