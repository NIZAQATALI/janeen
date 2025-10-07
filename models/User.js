
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    // Marital status
    maritalStatus: {
      type: String,
      enum: ["Married", "Unmarried"],
    },
    // Female-specific
    pregnancyStage: {
      type: String,
      enum: ["Pre-Pregnancy", "Pregnancy", "Post-Pregnancy"],
    },
    trimester: {
      type: String,
      enum: ["trimester-1", "trimester-2", "trimester-3"],
      required: function () {
        return this.pregnancyStage === "Pregnancy";
      },
    },

    // Male-specific
    fatherStatus: {
      type: String,
      enum: ["Father", "PlanningToBeFather"],
    },

    // General health toggle
    general_health: { type: String },
    password: { type: String, required: true },
    photo: { type: String },
    phone_number: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
      },
    ],
  },
  { timestamps: true }
);
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
// Compare password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model("User", userSchema);
