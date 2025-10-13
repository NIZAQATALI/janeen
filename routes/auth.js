import express  from "express";
import { sendVerificationCode} from "../Controllers/verficationController.js";
 import { upload } from '../MiddleWares/multer.middleware.js';
const router = express.Router()              
router.post('/send-verification-code',upload.single('file'),sendVerificationCode)
export default router
