import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const token = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "manuflow_secret", { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, target } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role, phone, target });

    res.status(201).json({
      token: token(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      token: token(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getMe = async (req, res) => res.json(req.user);

// Admin: get all team members
export const getTeam = async (req, res) => {
  try {
    const team = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(team);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, phone, target, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, target, role, isActive },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
