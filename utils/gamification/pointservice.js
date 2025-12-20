import PointEvent from "../../models/Pointevent.js";
import User from "../../models/User.js";
import { POINT_EVENTS } from "../../utils/gamification/pointConfig.js";
import { checkAndAwardBadges } from "./badgeservice.js";
export const awardPoints = async ({ userId, type, metadata = {} }) => {
  const points = POINT_EVENTS[type];
  if (!points) return;
 if (type === "READ_BLOG") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyRead = await PointEvent.findOne({
      userId,
      type,
      "metadata.blogId": metadata.blogId,
      createdAt: { $gte: today }
    });

    if (alreadyRead) return; 
  }
   /* 🔒 DAILY PROTECTION */
  if (type === "DAILY_LOGIN") {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyAwarded = await PointEvent.findOne({
      userId,
      type,
      createdAt: { $gte: startOfDay },
    });

    if (alreadyAwarded) return;
  }
if (type === "SHARE_SOCIAL") {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const exists = await PointEvent.findOne({
    userId,
    type,
    "metadata.blogId": metadata.blogId,
    "metadata.platform": metadata.platform,
    createdAt: { $gte: startOfDay },
  });

  if (exists) return;}

  // Save event (audit trail)
  await PointEvent.create({
    userId,
    type,
    points,
    metadata,
  });

  // Increment user points
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { points } },
    { new: true }
  );

  // Check badges after points update
  await checkAndAwardBadges(userId);

  return user;
};
