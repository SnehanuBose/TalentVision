const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ msg: "No token" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) {
      console.log("AUTH ERROR:", err);
      return res.status(403).json({ msg: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

module.exports = verifyToken;