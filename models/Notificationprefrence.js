// // models/NotificationPreference.js
// import mongoose from "mongoose";
// const preferenceSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
//     frequency: {
//       type: String,
//       enum: ["daily", "weekly", "monthly"],
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("NotificationPreference", preferenceSchema);
// models/NotificationPreference.js
import mongoose from "mongoose";
const preferenceSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      unique: true,
      required: true
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },

   
    category: {
      type: String,
      enum: ["baby", "pregnancy", "men"],
      required: true,
    },

    
    stageType: {
      type: String,
      enum: ["month", "year", "trimester", "general"],
      required: true,
    },
    stageValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("NotificationPreference", preferenceSchema);
