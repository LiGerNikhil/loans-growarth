import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  leadId?: mongoose.Types.ObjectId;
  actionType: string;
  performedBy?: mongoose.Types.ObjectId;
  description: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", index: true },
    actionType: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
export default Activity;
