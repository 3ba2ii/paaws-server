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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const Address_1 = require("./../entity/Address");
const User_1 = require("./../entity/UserEntities/User");
const calculateDistance_1 = require("../utils/calculateDistance");
let AddressResolver = class AddressResolver {
    async distance({ lat, lng }, { req, redis }) {
        const userId = req.session.userId;
        if (!userId) {
            return null;
        }
        let userLat;
        let userLng;
        let user;
        const userLocation = await redis.get(`userLocation${userId}`);
        if (userLocation) {
            const [latTemp, lngTemp] = userLocation.split('*');
            userLat = parseFloat(latTemp);
            userLng = parseFloat(lngTemp);
        }
        else {
            user = await User_1.User.findOne(userId);
            if (!user) {
                return null;
            }
            await redis.set(`userLocation${userId}`, `${user.lat}*${user.lng}`, 'ex', 60 * 5);
            userLat = user.lat;
            userLng = user.lng;
        }
        if (!userLat || !userLng)
            return null;
        return (0, calculateDistance_1.calculateDistance)(userLat, userLng, lat, lng);
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Address_1.Address, Object]),
    __metadata("design:returntype", Promise)
], AddressResolver.prototype, "distance", null);
AddressResolver = __decorate([
    (0, type_graphql_1.Resolver)(Address_1.Address)
], AddressResolver);
exports.default = AddressResolver;
//# sourceMappingURL=address.js.map