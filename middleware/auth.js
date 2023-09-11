const constant = require("../common/constant");
const response = require("../config/response");
const jwt = require("jsonwebtoken")

module.exports = middleware = {
  authenticateToken: async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return response.returnFalse(req, res, constant.TOKEN_REQUIRED, {});
    }
    const token = authorizationHeader.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        return response.returnFalse(req, res, constant.TOKEN_UNAUTHORIZED, {});
      }
      next();
    });
  },
};
