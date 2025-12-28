import express from "express";
import { verifyJWT } from "../utils/verifyToken.js";
import { shareOnSocial } from "../Controllers/socialController.js";
const router = express.Router();
router.post("/social-share", verifyJWT, shareOnSocial);
export default router;
