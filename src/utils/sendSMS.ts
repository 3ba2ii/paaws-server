require('dotenv-safe').config();

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

export const sendSMS = async (body: string, to: string) => {
  try {
    const response = await client.messages.create({
      body,
      from: '+18647564481',
      to,
    });
    console.log(
      `🚀 ~ file: sendSMS.ts ~ line 17 ~ sendSMS ~ response`,
      response
    );
    return {
      sent: true,
      response,
    };
  } catch (err) {
    console.log(`🚀 ~ file: sendSMS.ts ~ line 27 ~ sendSMS ~ err`, err);
    return {
      sent: false,
      err,
    };
  }
};
