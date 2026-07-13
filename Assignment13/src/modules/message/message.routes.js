import { Router } from "express";
import auth from "../../middleware/auth.middleware.js";
import {sendMessage, getMessages, deleteMessage} from "./message.controller.js";
import { uploadFiles, allowedMimeTypes } from "../../utils/multer/uploadFiles.js";


const router = Router();

//router.post("/:receiverId", sendMessage);


router.post(
    "/send-message",
    uploadFiles({
        destination: "messages",
        fileValidation: allowedMimeTypes.image
    }).array("images", 5),
    sendMessage
);



router.get("/", auth, getMessages);

router.delete("/:messageId", auth, deleteMessage);

export default router;