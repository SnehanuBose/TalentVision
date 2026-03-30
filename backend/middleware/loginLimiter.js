const { RateLimiterMongo } = require("rate-limiter-flexible");
const mongoose = require("mongoose");

const loginLimiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyPrefix: "login_fail",
  points: 5,
  duration: 60 * 15,
});

module.exports = loginLimiter;