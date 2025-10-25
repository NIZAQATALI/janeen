
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, },
    age: { type: Number, },
    gender: { type: String, enum: ["Male", "Female", "Other"]},  
    maritalStatus: {
      type: String,
      enum: ["Married", "Unmarried"],
    },
   
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

    fatherStatus: {
      type: String,
      enum: ["Father", "PlanningToBeFather"],
    },

    general_health: { type: String },
    password: { type: String, },
    photo: { type: String },
    phone_number: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
      },
    ],
   
    googleId: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },
        isGoogleUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model("User", userSchema);
