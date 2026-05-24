import Lead from "../models/Lead.js";

// Dashboard stats
export const getStats = async (req, res) => {
  try {
    const filter = req.user.role === "bda" ? { assignedTo: req.user._id } : {};

    const [total, byStatus, totalValue, wonValue, recentLeads, overdueFollowUps] =
      await Promise.all([
        Lead.countDocuments(filter),
        Lead.aggregate([
          { $match: filter },
          { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$dealValue" } } },
        ]),
        Lead.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: "$dealValue" } } }]),
        Lead.aggregate([
          { $match: { ...filter, status: "Won" } },
          { $group: { _id: null, total: { $sum: "$dealValue" } } },
        ]),
        Lead.find(filter).sort({ createdAt: -1 }).limit(5).select("companyName status createdAt assignedToName dealValue"),
        Lead.countDocuments({
          ...filter,
          nextFollowUp: { $lt: new Date() },
          status: { $nin: ["Won", "Lost"] },
        }),
      ]);

    const statusMap = {};
    byStatus.forEach(({ _id, count, value }) => {
      statusMap[_id] = { count, value };
    });

    res.json({
      total,
      pipeline: totalValue[0]?.total || 0,
      won: wonValue[0]?.total || 0,
      overdueFollowUps,
      byStatus: statusMap,
      recentLeads,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Team performance (admin only)
export const getTeamPerformance = async (req, res) => {
  try {
    const performance = await Lead.aggregate([
      { $group: {
        _id: "$assignedTo",
        name: { $first: "$assignedToName" },
        totalLeads: { $sum: 1 },
        wonLeads: { $sum: { $cond: [{ $eq: ["$status", "Won"] }, 1, 0] } },
        lostLeads: { $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } },
        totalValue: { $sum: "$dealValue" },
        wonValue: { $sum: { $cond: [{ $eq: ["$status", "Won"] }, "$dealValue", 0] } },
      }},
      { $sort: { wonValue: -1 } },
    ]);
    res.json(performance);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get leads with filter + search
export const getLeads = async (req, res) => {
  try {
    const { status, priority, search, assignedTo } = req.query;
    const filter = {};

    // BDA can only see their own leads
    if (req.user.role === "bda") filter.assignedTo = req.user._id;
    else if (assignedTo) filter.assignedTo = assignedTo;

    if (status && status !== "All") filter.status = status;
    if (priority && priority !== "All") filter.priority = priority;

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { product: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .select("-communications"); // don't send comms in list
    res.json(leads);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get single lead with communications
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email");
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Create lead
export const createLead = async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, industry, source,
            priority, dealValue, nextFollowUp, product, notes, assignedTo, assignedToName } = req.body;

    if (!companyName) return res.status(400).json({ message: "Company name required" });

    const lead = await Lead.create({
      companyName, contactPerson, email, phone, industry, source,
      priority, dealValue, nextFollowUp, product, notes,
      assignedTo: assignedTo || req.user._id,
      assignedToName: assignedToName || req.user.name,
    });
    res.status(201).json(lead);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update lead
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete lead
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Add communication log
export const addCommunication = async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!message) return res.status(400).json({ message: "Message required" });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.communications.unshift({
      type,
      message,
      addedBy: req.user._id,
      addedByName: req.user.name,
    });
    await lead.save();
    res.json(lead);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
