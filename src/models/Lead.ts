import mongoose, { Schema, Document, Model } from "mongoose";
import Counter from "./Counter";

export interface IRemark {
  text: string;
  author: string;
  createdAt: Date;
}

export interface ILead extends Document {
  leadId: string;
  name: string;
  mobile: string;
  email: string;
  monthlySalary: number;
  loanAmount: number;
  loanType: "Personal Loan" | "Business Loan" | "Loan Against Property" | "Overdraft Facility" | "Home Loan" | "Other";
  source: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "DOCUMENT_PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "CLOSED";
  assignedTo?: mongoose.Types.ObjectId;
  remarks: IRemark[];
  firstResponseAt?: Date;
  slaDeadline?: Date;
  connectorId?: mongoose.Types.ObjectId | null;
  bankName?: string;
  bankPayout?: number;
}

const RemarkSchema = new Schema<IRemark>(
  {
    text: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema = new Schema<ILead>(
  {
    leadId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    monthlySalary: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    loanType: {
      type: String,
      enum: ["Personal Loan", "Business Loan", "Loan Against Property", "Overdraft Facility", "Home Loan", "Other"],
      required: true,
    },
    source: { type: String, enum: ["Website", "Connector"], default: "Website" },
    connectorId: { type: Schema.Types.ObjectId, ref: "Connector", default: null },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"],
      default: "NEW",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    remarks: { type: [RemarkSchema], default: [] },
    firstResponseAt: { type: Date },
    slaDeadline: { type: Date },
    bankName: { type: String },
    bankPayout: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LeadSchema.pre("save", async function () {
  if (this.leadId) return;

  const year = new Date().getFullYear().toString();
  const counter = await Counter.findOneAndUpdate(
    { name: `leadId-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.leadId = `GCC-${year}-${String(counter.seq).padStart(4, "0")}`;
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
export default Lead;
