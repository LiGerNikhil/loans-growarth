import mongoose, { Schema, Document } from "mongoose";

export interface IOtpRequest extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

const OtpRequestSchema = new Schema<IOtpRequest>(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    verified: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.models.OtpRequest || mongoose.model<IOtpRequest>("OtpRequest", OtpRequestSchema);
