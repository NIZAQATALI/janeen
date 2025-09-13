import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    // Pregnancy details (for females)
    pregnancy: {
      type: Boolean,
      default: false, // false = not pregnant
    },
    pregnancy_stage: {
      type: String,
      enum: ["First Trimester", "Second Trimester", "Third Trimester"],
      required: function () {
        return this.pregnancy === true;
      },
    },
    // If not pregnant (for females)
    preconception: {
      type: Boolean,
      default: false, // true = planning pregnancy
    },
    // General health (applies to everyone)
    general_health: {
      type: Boolean,
      default: true,
    },

    password: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    phone_number:{
      type:Number,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    children: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Child",
  }
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
