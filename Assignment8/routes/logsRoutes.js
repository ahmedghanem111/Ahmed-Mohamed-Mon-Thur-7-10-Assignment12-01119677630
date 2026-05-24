import  express  from "express";
import { addLog } from "../controllers/logsController.js";

const router = express.Router();

router.post("/", addLog);

export default router;