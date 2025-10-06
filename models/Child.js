// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// const childSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     age: {
//       type: Number,
//       required: true,
//     },
//      email: {
//       type: String,
//       required: true,
//     },
//       role: {
//       type: String,
//       required: true,
//     },
//        password: {
//       type: String,
//       required: true,
//     },
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       required: true,
//     },
//     // Reference to mother (User)
//     mother: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // reference to User collection
//       required: true,
//     },
//   },
//   { timestamps: true }
// );
// // Hash password before saving
// childSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare password
// childSchema.methods.comparePassword = function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };
// export default mongoose.model("Child", childSchema);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true }, // needed for login
    password: { type: String, required: true },            // needed for login
    role: { type: String, enum: ["child", "user"], default: "child" },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    // New fields based on requirements
    category: {
      type: String,
      enum: [
        "Newborn",    
        "Toddler",    
        "Preschooler",
        "SchoolAge",  
        "Teen",      
        "YoungAdult"  
      ],
      required: true
    },
    ageRange: {
      type: String,
      enum: [
        "0–3 months",
        "4–6 months",
        "7–12 months",
        "1–3 years",
        "3–5 years",
        "6–12 years",
        "13–17 years",
        "18–21 years"
      ]
    },

    // Reference to parent (User)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
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
