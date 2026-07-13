import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../utils/redis/redis.client.js";

export const loginRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,

    standardHeaders: true,
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),

    message: {
        success: false,
        message: "Too many login attempts. Please try again after one minute.",
    },
});