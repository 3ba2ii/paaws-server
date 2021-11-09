"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepo = void 0;
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const types_1 = require("../types/types");
const Notification_1 = require("./../entity/Notification/Notification");
const MissingPost_1 = require("./../entity/PostEntities/MissingPost");
let NotificationRepo = class NotificationRepo extends typeorm_1.Repository {
    getMessageForNotification(performer, content, notificationType) {
        const contentType = content instanceof MissingPost_1.MissingPost ? 'post' : 'user';
        switch (notificationType) {
            case types_1.NotificationType.UPVOTE:
                return `${performer.full_name} upvoted your ${contentType}`;
            case types_1.NotificationType.DOWNVOTE:
                return `${performer.full_name} downvoted your ${contentType}`;
            case types_1.NotificationType.COMMENT_NOTIFICATION:
                return `${performer.full_name} commented on your ${contentType}`;
            case types_1.NotificationType.REPLY_NOTIFICATION:
                return `${performer.full_name} replied on your comment`;
            case types_1.NotificationType.MISSING_PET_AROUND_YOU:
                return `${performer.full_name} posted that there is a missing pet near you, Help him finding it!`;
            default:
                return null;
        }
    }
    async getNotificationsByUserId(userId) {
        return await Notification_1.Notification.createQueryBuilder('notification')
            .where('notification."userId" = :userId', { userId })
            .leftJoinAndSelect('notification.user', 'user')
            .getMany();
    }
    async createNotification({ performer, content, receiver, notificationType, customMessage, receiverId, }) {
        if (!receiverId && !receiver) {
            return null;
        }
        if (performer.id === (receiver === null || receiver === void 0 ? void 0 : receiver.id) || performer.id === receiverId) {
            console.log('❌ Performer is the same as receiver, so dont send a notification');
            return null;
        }
        const full_message = this.getMessageForNotification(performer, content, notificationType);
        const contentType = content instanceof MissingPost_1.MissingPost
            ? types_1.NOTIFICATION_CONTENT_TYPES.POST
            : types_1.NOTIFICATION_CONTENT_TYPES.USER;
        if (!full_message)
            return null;
        let expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);
        let notificationData = {
            contentId: content.id,
            message: customMessage ? customMessage : full_message,
            notificationType,
            contentType,
            expirationDate,
        };
        if (receiverId && typeof receiverId == 'number') {
            notificationData.userId = receiverId;
        }
        else {
            notificationData.user = receiver;
        }
        const notification = Notification_1.Notification.create(Object.assign({}, notificationData));
        return notification.save();
    }
};
NotificationRepo = __decorate([
    (0, typedi_1.Service)(),
    (0, typeorm_1.EntityRepository)(Notification_1.Notification)
], NotificationRepo);
exports.NotificationRepo = NotificationRepo;
//# sourceMappingURL=NotificationRepo.repo.js.map