import express from "express";
import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  getLeadStats,
} from "../controllers/leadController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All lead routes require authentication
router.use(protect);

router.get("/stats", getLeadStats);
router.get("/", getLeads);
router.post("/", createLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
