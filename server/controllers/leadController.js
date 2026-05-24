import Lead from "../models/Lead.js";

// GET /api/leads/stats  — dashboard summary
export const getLeadStats = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const byStatus = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    byStatus.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });

    res.status(200).json({
      total,
      new: statusMap["New"] || 0,
      contacted: statusMap["Contacted"] || 0,
      negotiation: statusMap["Negotiation"] || 0,
      won: statusMap["Won"] || 0,
      lost: statusMap["Lost"] || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/leads  — list all leads (with optional status filter & search)
export const getLeads = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/leads
export const createLead = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, source, notes } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const lead = await Lead.create({
      companyName,
      contactPerson,
      email,
      phone,
      source,
      notes,
    });

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/leads/:id  — update any field(s)
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
