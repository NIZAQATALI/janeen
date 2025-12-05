import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    content: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String, // Cloudinary URL
      default: null,
    },

    category: {
      type: String,
      enum: ["Pregnancy", "Parenting", "Child Health", "Nutrition", "Other"],
      default: "Other",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-create slug
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  next();
});

export default mongoose.model("Blog", blogSchema);
