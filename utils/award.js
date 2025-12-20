import { POINT_EVENTS } from "./pointsConfig.js";
import PointEvent from "../../models/PointEvent.js";
import User from "../../models/User.js";
export const awardPoints = async (userId, eventType, metadata = {}) => {
  const config = POINT_EVENTS[eventType];
  if (!config) return;
  // 🛑 One-time rewards
  if (config.oneTime) {
    const exists = await PointEvent.findOne({ userId, type: eventType });
    if (exists) return;
  }
  // 🛑 One-time per course
  if (config.oneTimePerCourse && metadata.courseId) {
    const exists = await PointEvent.findOne({
      userId,
      type: eventType,
      "metadata.courseId": metadata.courseId,
    });
    if (exists) return;
  }
  // 🛑 Daily limit
  if (config.dailyLimit) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayCount = await PointEvent.countDocuments({
      userId,
      type: eventType,
      createdAt: { $gte: startOfDay }
    });

    if (todayCount >= config.dailyLimit) return;
  }

  // ✅ Award points
  await User.findByIdAndUpdate(userId, {
    $inc: { points: config.points }
  });

  await PointEvent.create({
    userId,
    type: eventType,
    points: config.points,
    metadata
  });
};
