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
exports.NotificationResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Notification_1 = require("./../entity/Notification/Notification");
let NotificationResolver = class NotificationResolver {
    async url({ contentId }) {
        return `localhost:3000/posts/${contentId}`;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Notification_1.Notification]),
    __metadata("design:returntype", Promise)
], NotificationResolver.prototype, "url", null);
NotificationResolver = __decorate([
    (0, type_graphql_1.Resolver)(Notification_1.Notification)
], NotificationResolver);
exports.NotificationResolver = NotificationResolver;
//# sourceMappingURL=notification.js.map