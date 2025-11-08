// models/NotificationPreference.js
import mongoose from "mongoose";
const preferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("NotificationPreference", preferenceSchema);
