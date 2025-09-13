import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
      user_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    venue: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Music', 'Sports', 'Conference', 'Workshop', 'Theater'], 
    },
    currency: {
      type: String,
      enum: [
        "USD", "EUR", "GBP", "AUD", "CAD", "JPY", "INR", "SGD", "NZD", "CHF", "HKD",
        "SEK", "NOK", "DKK", "ZAR", "MXN", "BRL", "PHP", "IDR", "MYR", "THB", "VND",
        "KRW", "CNY", "ARS", "CLP", "COP", "PEN", "PLN", "CZK", "HUF", "RUB", "TRY",
        "ILS", "SAR", "AED", "QAR", "EGP", "KES", "NGN", "TZS", "UGX", "XOF", "XAF",
        "MAD", "BHD", "OMR", "JOD", "KWD"
      ], 
    },
    gallery: {
      type: [String],
      default: [], 
    },
    ticket: {
      type: String,
      enum: ["Online", "Walk-in"], 
 
    },
    subscriptionPlan: {
      type: String,
      enum: ["Simple", "Standard", "Premium"], 
      default: "Simple", 
    },
    // subscriptionPlan: {
    //   type: String,
    //   enum: ["Simple", "Standard", "Premium"], 
    //   default: "Simple", 
    // },
    vipprice: {
      type: Number,
      required: true,
    },
    economyprice:{
      type: Number},
    eventDate: {
      type: Date,
      
  },
  eventTime: {
      type: Date,
      
  },
    vipSize: {
        type: Number,
        
    },
    TotalCapacity: {
      type: Number,
      
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
},
paymentDetails: {
    paymentIntentId: { type: String },
    paymentMethod: { type: String },
    sessionStorageId: { type: String },
},

    
    economySize: {
      type: Number,
      
    },
    availableSeats: { type: [String],
      default: [], 
     },
   
    featured: {
      type: Boolean,
      default: false,
    },
    reservedSeats: { 
      type: [String], 
      default: [], 
    }
,    
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// eventSchema.pre("save", function (next) {
//   if (this.isNew && this.TotalCapacity > 0) {
//     this.availableSeats = Array.from({ length: this.TotalCapacity }, (_, i) => i + 1);
//   }
//   next();
// });
export default mongoose.model("Event", eventSchema);