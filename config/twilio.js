require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;

const client = require("twilio")(accountSid, authToken);

const twilioFunctions = {
  client,
  verifySid,
  generateOTP: async (mobNumber, channel) => {
    return client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${mobNumber}`, channel: channel });
  },
};

module.exports = twilioFunctions;
