const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET is not configured" });
  }

  try {
    jwt.verify(match[1], secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return next(error);
  }

  return next();
}

module.exports = authenticateToken;
