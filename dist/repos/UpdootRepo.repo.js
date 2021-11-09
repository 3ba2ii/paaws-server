"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdootRepo = void 0;
const typedi_1 = require("typedi");
const typeorm_1 = require("typeorm");
const Updoot_1 = require("../entity/InteractionsEntities/Updoot");
const errors_1 = require("./../errors");
let UpdootRepo = class UpdootRepo extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.conn = (0, typeorm_1.getConnection)();
    }
    async saveUpdoot(updoot, entity) {
        return this.conn
            .transaction(async (_) => {
            await updoot.save();
            await entity.save();
        })
            .then(() => ({ success: true }))
            .catch((e) => ({
            success: false,
            errors: [
                errors_1.INTERNAL_SERVER_ERROR,
                { code: 500, field: 'server', message: e.message },
            ],
        }));
    }
    getLastChangeTimeDiff(updoot) {
        const lastUpdooted = updoot.updatedAt;
        const now = new Date();
        const timeDiff = now.getTime() - lastUpdooted.getTime();
        return Math.ceil(timeDiff / (1000 * 60));
    }
    checkSpam(updoot) {
        const diffInMinutes = this.getLastChangeTimeDiff(updoot);
        return diffInMinutes <= 10 && updoot.changes > 5;
    }
    async updateUpdootValue({ updoot, entity, value, }) {
        if (this.checkSpam(updoot)) {
            console.log('❌ SPAM');
            return {
                success: false,
                errors: [
                    {
                        code: 400,
                        message: 'You have changed your vote more than 5 times in the last 10 minutes. Please stop spamming',
                        field: 'spam',
                    },
                ],
            };
        }
        updoot.value = value;
        entity.points += 2 * value;
        updoot.changes += 1;
        return this.saveUpdoot(updoot, entity);
    }
    async createUpdoot({ updootTarget, entity, user, value, type, }) {
        const repo = this.conn.getRepository(updootTarget);
        const newUpdoot = repo.create({
            [type]: entity,
            user,
            value,
        });
        entity.points += value;
        return this.saveUpdoot(newUpdoot, entity);
    }
    async deleteUpdoot(targetUpdoot, entity) {
        entity.points -= targetUpdoot.value;
        return this.conn
            .transaction(async (_) => {
            await targetUpdoot.remove();
            await entity.save();
        })
            .then(() => ({ success: true }))
            .catch(() => ({
            success: false,
            errors: [
                errors_1.INTERNAL_SERVER_ERROR,
                {
                    code: 500,
                    field: 'server',
                    message: 'Something went wrong while deleting the updoot',
                },
            ],
        }));
    }
};
UpdootRepo = __decorate([
    (0, typedi_1.Service)(),
    (0, typeorm_1.EntityRepository)(Updoot_1.Updoot)
], UpdootRepo);
exports.UpdootRepo = UpdootRepo;
//# sourceMappingURL=UpdootRepo.repo.js.map