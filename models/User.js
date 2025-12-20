import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ENUMS } from "../utils/constant/constant.js"; 

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ENUMS.GENDER },
    maritalStatus: { type: String, enum: ENUMS.MARITAL_STATUS },
    pregnancyStage: { type: String, enum: ENUMS.PREGNANCY_STAGE },
    trimester: {
      type: String,
      enum: ENUMS.TRIMESTER,
      required: function () {
        return this.pregnancyStage === "Pregnancy";
      },
    },
    pregnancyStartDate: { type: Date },
    fatherStatus: { type: String, enum: ENUMS.FATHER_STATUS },
    general_health: { type: String },
    password: { type: String },
    photo: { type: String },
    phone_number: { type: String },
    role: { type: String, enum: ENUMS.ROLE, default: "user" },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Child" }],
    googleId: { type: String },
    provider: { type: String, enum: ENUMS.PROVIDER, default: "local" },
    isGoogleUser: { type: Boolean, default: false },
    lastLogin: {
  type: Date,
  default: null,
},
points: {
  type: Number,
  default: 0,
},
loginCount: { type: Number, default: 0 },
blogsRead: { type: Number, default: 0 },
blogsCreated: { type: Number, default: 0 },

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
