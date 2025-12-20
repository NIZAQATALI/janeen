import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: String,
  icon: String,
  category: String,
  pointsRequired: Number,
  description: String
}, { timestamps: true });

export default mongoose.model("Badge", badgeSchema);
