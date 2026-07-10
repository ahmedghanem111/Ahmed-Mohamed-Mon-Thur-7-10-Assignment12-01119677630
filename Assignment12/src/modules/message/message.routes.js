import { Router } from "express";
import auth from "../../middleware/auth.middleware.js";
import {sendMessage, getMessages, deleteMessage} from "./message.controller.js";

const router = Router();

router.post("/:receiverId", sendMessage);

router.get("/", auth, getMessages);

router.delete("/:messageId", auth, deleteMessage);

export default router;