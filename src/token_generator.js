const Twilio = require("twilio");
const { connect } = require("twilio-video");
const config = require("./config");
const nameGenerator = require("../name_generator");
const client = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_API_SECRET);
// Access Token used for Chat and Sync
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VideoGrant = AccessToken.VideoGrant;
const SyncGrant = AccessToken.SyncGrant;
const MAXIMUM_SESSION_DURATION = 60;

/**
 * Generate an Access Token for an application user - it generates a random
 * username for the client requesting a token or generates a token with an
 * identity if one is provided.
 *
 * @return {Object}
 *         {Object.identity} String random indentity
 *         {Object.token} String token generated
 */
function tokenGenerator(identity, room, dateTime, duration) {
  // Create an access token which we will sign and return to the client
  const token = new AccessToken(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_API_KEY,
    config.TWILIO_API_SECRET,
  );
  token.ttl = Number(duration);
  token.nbf = Number(dateTime);
  token.identity = identity;
  //token.identity = identity || nameGenerator();

  // Assign the provided identity or generate a new one
  
  if (config.TWILIO_CHAT_SERVICE_SID) {
    // Create a "grant" which enables a client to use IPM as a given user,
    // on a given device
    const chatGrant = new ChatGrant({
      serviceSid: config.TWILIO_CHAT_SERVICE_SID,
    });
    token.addGrant(chatGrant);
  }

  const videoGrant = new VideoGrant({
    room: room
  });
  //videoGrant.room = room;
  token.addGrant(videoGrant);

  if (config.TWILIO_SYNC_SERVICE_SID) {
    // Point to a particular Sync service, or use the account default to
    // interact directly with Functions.
    const syncGrant = new SyncGrant({
      serviceSid: config.TWILIO_SYNC_SERVICE_SID || "default",
    });
    token.addGrant(syncGrant);
  }
  
  //console.log(token);
  console.log(token);
  // Serialize the token to a JWT string and include it in a JSON response
  return {
    identity: token.identity,
    token: token.toJwt(),
  };
}

module.exports = tokenGenerator;
