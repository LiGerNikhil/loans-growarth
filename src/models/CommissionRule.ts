import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommissionRule extends Document {
  loanType: "Personal Loan" | "Business Loan" | "Loan Against Property" | "Overdraft Facility" | "Home Loan" | "Other";
  commissionType: "FLAT" | "PERCENTAGE";
  value: number;
  effectiveFrom: Date;
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommissionRuleSchema = new Schema<ICommissionRule>(
  {
    loanType: {
      type: String,
      enum: ["Personal Loan", "Business Loan", "Loan Against Property", "Overdraft Facility", "Home Loan", "Other"],
      required: true,
    },
    commissionType: {
      type: String,
      enum: ["FLAT", "PERCENTAGE"],
      required: true,
    },
    value: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const CommissionRule: Model<ICommissionRule> =
  mongoose.models.CommissionRule || mongoose.model<ICommissionRule>("CommissionRule", CommissionRuleSchema);
export default CommissionRule;
