import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: String,
  iconUrl: String,
  category: String,
  points: Number,
  description: String
}, { timestamps: true });

export default mongoose.model("Badge", badgeSchema);
