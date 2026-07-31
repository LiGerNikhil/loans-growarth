import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConnectorPayout extends Document {
  connectorId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  loanType: string;
  loanAmountDisbursed: number;
  commissionAmount: number;
  commissionRuleApplied?: mongoose.Types.ObjectId;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  paymentReference?: string;
  flaggedForReview?: boolean;
}

const ConnectorPayoutSchema = new Schema<IConnectorPayout>(
  {
    connectorId: { type: Schema.Types.ObjectId, ref: "Connector", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    loanType: { type: String, required: true },
    loanAmountDisbursed: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    commissionRuleApplied: { type: Schema.Types.ObjectId, ref: "CommissionRule" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PAID", "REJECTED"],
      default: "PENDING",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    paidAt: { type: Date },
    paymentReference: { type: String },
    flaggedForReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ConnectorPayout: Model<IConnectorPayout> =
  mongoose.models.ConnectorPayout || mongoose.model<IConnectorPayout>("ConnectorPayout", ConnectorPayoutSchema);
export default ConnectorPayout;
