import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
     email: {
      type: String,
      required: true,
    },
      role: {
      type: String,
      required: true,
    },
       password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    // Reference to mother (User)
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
      required: true,
    },
  },
  { timestamps: true }
);
// Hash password before saving
childSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
childSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model("Child", childSchema);
