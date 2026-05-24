import express from "express";
import {
  getStats, getTeamPerformance, getLeads, getLead,
  createLead, updateLead, deleteLead, addCommunication,
} from "../controllers/leadController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.get("/team-performance", adminOnly, getTeamPerformance);
router.get("/", getLeads);
router.get("/:id", getLead);
router.post("/", createLead);
router.put("/:id", updateLead);
router.delete("/:id", adminOnly, deleteLead);
router.post("/:id/communicate", addCommunication);

export default router;
