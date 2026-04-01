
const jwt = require("jsonwebtoken");

const SECRET = "4b3339388eee4543ae8de8f1c97dec2ebf2d350ccd9f9a80807a1841752dcef897d9e3132561d48c64b33b6b5e40e020561eb9e15f7598f499445fef723ef88b";

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, SECRET, {
    expiresIn: "7d",
  });
};

module.exports = { generateAccessToken, generateRefreshToken };