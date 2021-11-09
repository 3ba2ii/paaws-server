"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
require('dotenv-safe').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const sendSMS = async (body, to) => {
    try {
        const response = await client.messages.create({
            body,
            from: '+17722911815',
            to,
        });
        console.log(`🚀 ~ file: sendSMS.ts ~ line 17 ~ sendSMS ~ response`, response);
        return {
            sent: true,
            response,
        };
    }
    catch (err) {
        return {
            sent: false,
            err,
        };
    }
};
exports.sendSMS = sendSMS;
//# sourceMappingURL=sendSMS.js.map