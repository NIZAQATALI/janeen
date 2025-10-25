
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// const childSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     age: { type: Number, required: true },
//     email: { type: String, required: true, unique: true }, 
//     password: { type: String, required: true },            
//     role: { type: String, enum: ["child"], default: "child" },
//     gender: { type: String, enum: ["Male", "Female", "Child"], required: true },

   
//     category: {
//       type: String,
//       enum: [
//         "Newborn",    
//         "Toddler",    
//         "Preschooler",
//         "SchoolAge",  
//         "Teen",      
//         "YoungAdult"  
//       ],
//       required: true
//     },
//     ageRange: {
//       type: String,
//       enum: [
//         "0–3 months",
//         "4–6 months",
//         "7–12 months",
//         "1–3 years",
//         "3–5 years",
//         "6–12 years",
//         "13–17 years",
//         "18–21 years"
//       ]
//     },

   
//     parent: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     }
//   },
//   { timestamps: true }
// );


// childSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });


// childSchema.methods.comparePassword = function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// export default mongoose.model("Child", childSchema);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const childSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },          
    role: { type: String, enum: ["child"], default: "child" },
    gender: { type: String, enum: ["Male", "Female", "Child"], required: true },

  
    
    category: {
      type: String,
      enum: [
        "Newborn (0–12 months)",    
        "Toddler (1–3 years)",    
        "Preschooler (3–5 years)",
        "SchoolAge (6–12 years)",  
        "Teen (13–17 years)",      
        "YoungAdult (18–21 years)"  
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


childSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


childSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Child", childSchema);