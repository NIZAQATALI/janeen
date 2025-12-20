import mongoose from "mongoose";

const pointEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: [
        "LOGIN",
        "DAILY_LOGIN",
        "READ_BLOG",
        "CREATE_BLOG",
        "SHARE_SOCIAL",
        "COMPLETE_PROFILE",
        "COURSE_COMPLETE"
      ],
      required: true
    },

    points: {
      type: Number,
      required: true
    },

    metadata: {
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
      },
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      },
      platform: {
        type: String,
        enum: ["facebook", "whatsapp", "twitter", "linkedin"]
      }
    }
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    versionKey: false
  }
);

export default mongoose.model("PointEvent", pointEventSchema);
