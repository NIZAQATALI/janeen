
import mongoose from "mongoose";
const verificationCodeSchema = new mongoose.Schema({
email: { type: String, required: true },
code: { type: String, required: true,  },
 expiresAt: { type: Date, required: true },
});
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model("VerificationCode",verificationCodeSchema);