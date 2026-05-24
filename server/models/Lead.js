import mongoose from "mongoose";

// FIX: Field names now match the frontend form (companyName, contactPerson)
// FIX: Status enum now matches the frontend dropdown options
const leadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "New",
      // FIX: enum aligned with frontend dropdown options
      enum: ["New", "Contacted", "Negotiation", "Won", "Lost"],
    },
    source: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
