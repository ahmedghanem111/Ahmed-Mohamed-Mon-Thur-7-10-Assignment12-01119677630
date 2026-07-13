import { Router } from "express";
import auth from "../../middleware/auth.middleware.js";
import authorization from "../../middleware/authorization.middleware.js";
import { deleteUser } from "./user.controller.js";
import multer from "multer";
import { uploadFiles } from "../../utils/multer/uploadFiles.js";


const router = Router();

router.patch("/profile-pic",auth,
    uploadFiles({destination: "users/profileImage"}).
    single("profileImage"),

    async (req, res, next) => {
        req.user.profilePic = req.file.path;
        await req.user.save();

        res.json({
            user: req.user,
        })
    }
)



router.delete("/:id", auth, authorization("admin"), deleteUser);


export default router;