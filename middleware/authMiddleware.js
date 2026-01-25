const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // No token present
  if (!authHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Extract token: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    // Continue to next function
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
