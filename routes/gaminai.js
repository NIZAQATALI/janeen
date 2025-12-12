import express from "express";
import { chatWithGemini } from "../Controllers/gaminaiController.js";
import { verifyAdmin ,verifyJWT} from "../utils/verifyToken.js";

const router = express.Router();

router.post("/chat", verifyJWT, chatWithGemini);

export default router;
