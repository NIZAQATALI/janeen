import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ENUMS } from "../utils/constant/constant.js"; 

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthDate: { type: Date },

    role: { type: String, enum: ENUMS.CHILD_ROLE, default: "child" },
    gender: { type: String, enum: ENUMS.CHILD_GENDER, required: true },
    category: { type: String, enum: ENUMS.CHILD_CATEGORY, required: true },
    ageRange: { type: String, enum: ENUMS.CHILD_AGE_RANGE },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", default:null },
    lastLogin: {
  type: Date,
  default: null,
}

  },
  { timestamps: true }
);

childSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

childSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Child", childSchema);
