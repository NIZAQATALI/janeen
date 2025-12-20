import Badge from "../../models/Badge.js";
import UserBadge from "../../models/Userbadge.js";
import User from "../../models/User.js";

export const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const eligibleBadges = await Badge.find({
    pointsRequired: { $lte: user.points }
  });

  for (const badge of eligibleBadges) {
    const exists = await UserBadge.findOne({
      userId,
      badgeId: badge._id
    });

    if (!exists) {
      await UserBadge.create({
        userId,
        badgeId: badge._id
      });
    }
  }
};
