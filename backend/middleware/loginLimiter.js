const { RateLimiterMongo } = require("rate-limiter-flexible");
const mongoose = require("mongoose");

let loginLimiter = null;

const initLoginLimiter = () => {
  loginLimiter = new RateLimiterMongo({
    storeClient: mongoose.connection,
    keyPrefix: "login_fail",
    points: 5,
    duration: 60 * 15,
  });
};

const getLoginLimiter = () => loginLimiter;

module.exports = {
  initLoginLimiter,
  getLoginLimiter,
};