import express from "express";
import { verifyJWT, verifyAdmin } from "../utils/verifyToken.js";
import {
  createBadge,
  getBadges,
  getBadgeById,
  updateBadge,
  deleteBadge
} from "../Controllers/badgeController.js";
import { awardPoints } from "../utils/gamification/pointservice.js";

const router = express.Router();

router.use(verifyJWT);


router.post('/createBadge', createBadge);


router.get('/getAllBadges', getBadges);


router.get('/getBadge/:id', getBadgeById);


router.put('/updateBadge/:id', updateBadge);


router.delete('/deleteBadge/:id', deleteBadge);
router.post("/test/award-points", verifyJWT, async (req, res) => {
  await awardPoints({
    userId: req.user.id,
    type: "READ_BLOG",
    metadata: { blogId: "6935887ca843f74138fa9fff" }
  });
  res.json({ success: true });
});

export default router;
