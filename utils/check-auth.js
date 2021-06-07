const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server");

const secretKey = process.env.SECRET_KEY;

const checkAuth = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    // a convention to name the token Bearer ...
    const token = authHeader.split("Bearer ")[1];

    if (token) {
      try {
        const user = jwt.verify(token, secretKey);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }

    throw new Error('Autentication token must be "Bearer [token]');
  }

  throw new Error("Autorization header token must be provided");
};

module.exports = checkAuth;
