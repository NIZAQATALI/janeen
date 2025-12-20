// routes/leaderboard.js
import express from "express";
import { getGamificationDashboard, getLeaderboard } from "../Controllers/leaderboardController.js";
import { verifyJWT } from "../utils/verifyToken.js";
import { verify } from "crypto";
const router = express.Router();
router.get("/getGamificationDashboard",verifyJWT, getGamificationDashboard);
router.get("/:period",  getLeaderboard);


export default router;
