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

await redisClient.connect()
    .then(()=>{
        console.log("redis connected successfully");
    }).catch((err) =>{
        console.log("redis connected failed => ", err)
    })



// await redisClient.set("tryEX", "test test", {
//   expiration: {
//     type: "EX",
//     value: 20,
//   },
// });
// console.log(await redisClient.get("tryEX"))
  
//  await sendEmail({
//     to: "ahmed137mohamed4@gmail.com",
//     subject: "confirm your email",
//     html: generateHtml(123456),
//  });
app.use(express.json());
app.use("/uploads", express.static("./uploads"));
app.use(cors());
app.use("/auth", authRouter); 
app.use("/message", messageRouter);
app.use("/user", userRouter);

export default app;