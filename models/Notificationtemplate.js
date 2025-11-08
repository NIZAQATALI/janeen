
import mongoose from "mongoose";
const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("NotificationTemplate", templateSchema);
