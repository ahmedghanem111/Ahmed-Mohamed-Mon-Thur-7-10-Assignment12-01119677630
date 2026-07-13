import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/security/token/token.js";
import User from "../modules/user/user.model.js";
import { redisClient } from "../utils/redis/redis.client.js";
import { revokeTokenKey } from "../utils/redis/redis.services.js";

export const TokenType = {
  access: "access",
  refresh: "refresh",
};


export const decodeToken = async (authorization, tokenType = TokenType.access) => {
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("In-valid authentication");
  }
  
  const token = authorization.split(" ")[1];
    if (!token) {
      throw new Error("In-valid authentication");
    }
  const payload = verifyToken(
    token,
    tokenType == TokenType.access?
     process.env.ACCESS_JWT_SECRET
     : tokenType == TokenType.refresh ?
      process.env.REFRESH_JWT_SECRET 
      : null 
  );
  
  const userId = payload.id;
  const redisTokenId = revokeTokenKey(payload.id, payload.jti)
  if (!(await redisClient.get(redisTokenId))) {
    throw new Error("Login again");
  }
  const user = await User.findById(userId)
  if (!user) {
    throw new Error("User Not Found");
  }
  return { user, decodedToken: payload }
}

 
const auth = async(req, res, next) => {
  const authorization = req.headers.authorization 
  const { user, decodedToken } = await decodeToken(authorization, TokenType.access)
  req.user = user;
  req.decodedToken = decodedToken
  next(); 

};

export default auth;