"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
async function sendEmail(to, html, subject, _template) {
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    mail_1.default.setApiKey(SENDGRID_API_KEY || '');
    const msg = {
        to,
        from: 'nodejscourseemail@gmail.com',
        subject,
        html,
    };
    const response = await mail_1.default.send(msg);
    console.log(`🚀 ~ file: sendEmail.ts ~ line 16 ~ sendEmail ~ response`, response);
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map