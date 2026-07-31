import mongoose, { Schema, Document, Model } from "mongoose";
import Counter from "./Counter";
import { encrypt, decrypt } from "@/lib/encryption";

export interface IBankDetails {
  accountNumber?: string;
  ifsc?: string;
  accountHolderName?: string;
}

export interface IConnector extends Document {
  connectorCode: string;
  name: string;
  mobile: string;
  email: string;
  city: string;
  networkType: "Shopkeeper" | "Insurance Agent" | "CA/Accountant" | "Real Estate Broker" | "Individual" | "Other";
  bankDetails?: IBankDetails;
  status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  totalLeadsReferred: number;
  totalCommissionEarned: number;
}

const BankDetailsSchema = new Schema<IBankDetails>(
  {
    accountNumber: { type: String },
    ifsc: { type: String },
    accountHolderName: { type: String },
  },
  { _id: false }
);

function encryptBank(doc: IConnector) {
  if (doc.bankDetails) {
    const bd = doc.bankDetails;
    if (bd.accountNumber && typeof bd.accountNumber === "string" && !bd.accountNumber.startsWith("ENC:")) {
      bd.accountNumber = "ENC:" + encrypt(bd.accountNumber);
    }
    if (bd.ifsc && typeof bd.ifsc === "string" && !bd.ifsc.startsWith("ENC:")) {
      bd.ifsc = "ENC:" + encrypt(bd.ifsc);
    }
    if (bd.accountHolderName && typeof bd.accountHolderName === "string" && !bd.accountHolderName.startsWith("ENC:")) {
      bd.accountHolderName = "ENC:" + encrypt(bd.accountHolderName);
    }
  }
}

const ConnectorSchema = new Schema<IConnector>(
  {
    connectorCode: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    networkType: {
      type: String,
      enum: ["Shopkeeper", "Insurance Agent", "CA/Accountant", "Real Estate Broker", "Individual", "Other"],
      required: true,
    },
    bankDetails: { type: BankDetailsSchema, default: undefined },
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED"],
      default: "PENDING_APPROVAL",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    totalLeadsReferred: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ConnectorSchema.pre("save", async function () {
  if (!this.connectorCode) {
    const counter = await Counter.findOneAndUpdate(
      { name: "connectorCode" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.connectorCode = `GCC-CNR-${String(counter.seq).padStart(4, "0")}`;
  }
  encryptBank(this);
});

ConnectorSchema.post("init", function () {
  const bd = this.bankDetails as IBankDetails | undefined;
  if (bd) {
    if (typeof bd.accountNumber === "string" && bd.accountNumber.startsWith("ENC:")) {
      bd.accountNumber = decrypt(bd.accountNumber.slice(4));
    }
    if (typeof bd.ifsc === "string" && bd.ifsc.startsWith("ENC:")) {
      bd.ifsc = decrypt(bd.ifsc.slice(4));
    }
    if (typeof bd.accountHolderName === "string" && bd.accountHolderName.startsWith("ENC:")) {
      bd.accountHolderName = decrypt(bd.accountHolderName.slice(4));
    }
  }
});

const Connector: Model<IConnector> = (mongoose.models.Connector as Model<IConnector> | undefined) || mongoose.model<IConnector>("Connector", ConnectorSchema);
export default Connector;
