import multer from "multer";
import fs from "fs/promises";
import { memoryStorage, diskStorage } from "multer";


export const allowedMimeTypes = {
    image: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ],
};


export const uploadFiles = ({ destination = "general", fileValidation = allowedMimeTypes.image }) => {

    // const dest = "./uploads";
    // const storage = memoryStorage();


    const storage = diskStorage({
        destination:async (req, file, cb) => {
            console.log({ "fileName": file.originalname });
            const folderName = "./uploads/" + destination;

            try{
                await fs.access(folderName);
                console.log("folder exists");
                
            } catch (error) {
                console.log("folder not found, creating it now");
                await fs.mkdir(folderName, { recursive: true });
            }


            cb(null, folderName);
        },
        filename: (req, file, cb) => {
            // if (file.originalname.startsWith("Abo")) {
            //     return cb(new Error("File name starts with `Abo`"));
            // }
            cb(null, `${Date.now()}-${file.originalname}`);
        }
        
    })    



    const fileFilter = (req, file, cb) => {
        if (!allowedMimeTypes.image.includes(file.mimetype)) {
            return cb(new Error("Only images are allowed"));
        }

        cb(null, true);
    }; 


    return multer({
        storage,

        limits: {
            fileSize: 1024 * 1024 * 5 // 5MB
        },
        fileFilter
    })
}
