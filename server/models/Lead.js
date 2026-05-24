import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["call", "email", "meeting", "note"], default: "note" },
    message: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedByName: { type: String },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    industry: { type: String, trim: true },
    source: {
      type: String,
      enum: ["cold-call", "referral", "website", "exhibition", "linkedin", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Negotiation", "Won", "Lost"],
      default: "New",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dealValue: { type: Number, default: 0 }, // expected deal value in rupees
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedToName: { type: String },
    nextFollowUp: { type: Date },
    communications: [communicationSchema],
    product: { type: String, trim: true }, // what product/service they want
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
