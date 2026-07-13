import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import messageRouter from "./modules/message/message.routes.js";
import dbConnection from "./config/db.js";
import userRouter from "./modules/user/user.routes.js";
import cors from "cors";
import { sendEmail } from "./utils/Email/sendEmail.js";
import generateHtml from "./utils/Email/html.template.js";
import { redisClient } from "./utils/redis/redis.client.js";
import { connect } from "mongoose";

const app = express();

await dbConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("./uploads"));
app.use(cors());
app.use("/auth", authRouter); 
app.use("/message", messageRouter);
app.use("/user", userRouter);

export default app;