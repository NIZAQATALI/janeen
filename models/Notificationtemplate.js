
// import mongoose from "mongoose";
// const templateSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     message: { type: String, required: true },
//     type: {
//       type: String,
//       enum: ["daily", "weekly", "monthly"],
//       required: true,
//     },
//   },
//   { timestamps: true }
// );
// export default mongoose.model("NotificationTemplate", templateSchema);
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

    category: {
      type: String,
      enum: ["baby", "pregnancy", "men"],
      required: true,
    },

    // Example: baby (1 year), pregnancy (trimester 3)
    stageType: {
      type: String,
      enum: ["year", "month", "trimester", "general"],
      required: true,
    },

    stageValue: { type: Number, required: true }, // e.g., 1 year OR 3rd trimester
  },
  { timestamps: true }
);

export default mongoose.model("NotificationTemplate", templateSchema);

