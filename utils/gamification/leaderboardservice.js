import Leaderboard from "../../models/Leaderboard.js";
import User from "../../models/User.js";

export const generateLeaderboardSnapshot = async (period) => {
  let startDate = new Date();

  if (period === "daily") {
    startDate.setHours(0, 0, 0, 0);
  }

  if (period === "weekly") {
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day);
    startDate.setHours(0, 0, 0, 0);
  }

  if (period === "monthly") {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  }

  const users = await User.find({})
    .sort({ points: -1 })
    .limit(100)
    .select("_id points");

  const rankedUsers = users.map((user, index) => ({
    userId: user._id,
    points: user.points,
    rank: index + 1,
  }));

  await Leaderboard.create({
    period,
    users: rankedUsers,
    generatedAt: new Date(),
  });
};
