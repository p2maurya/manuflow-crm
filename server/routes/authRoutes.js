import express from "express";
import { register, login, getMe, getTeam, updateUser } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/team", protect, adminOnly, getTeam);
router.put("/team/:id", protect, adminOnly, updateUser);

export default router;
