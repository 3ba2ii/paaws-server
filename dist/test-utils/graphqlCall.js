"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlCall = void 0;
const graphql_1 = require("graphql");
const createApolloServer_1 = require("../utils/createApolloServer");
const createSchema_1 = require("../utils/createSchema");
let redis;
const graphqlCall = async ({ source, variableValues }) => {
    return (0, graphql_1.graphql)({
        schema: await (0, createSchema_1.createSchema)(),
        source,
        variableValues,
        contextValue: await (0, createApolloServer_1.createApolloServer)(redis),
    });
};
exports.graphqlCall = graphqlCall;
//# sourceMappingURL=graphqlCall.js.map