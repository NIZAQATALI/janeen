import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },

    users: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        points: { type: Number, required: true },
        rank: { type: Number, required: true },
      },
    ],

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Leaderboard", leaderboardSchema);
