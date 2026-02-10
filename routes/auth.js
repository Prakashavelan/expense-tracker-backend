const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

/*
 ✅ Register User
 POST /api/auth/register
*/
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });

      res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/*
 ✅ Login User
 POST /api/auth/login
*/
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        msg: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.json({ msg: "If email exists, reset link sent." });

  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");

  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetLink =
    `https://prakashavelan.github.io/Expense-Tracker/reset-password.html?token=${token}`;

  const html = `
    <h2>Password Reset</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link expires in 15 minutes.</p>
  `;

  await sendEmail(email, "Password Reset", html);

  res.json({ msg: "Reset link sent to your email ✅" });
});



/* ✅ Reset Password */
router.post("/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const token = req.params.token;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.json({ msg: "Token expired or invalid" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  user.resetToken = null;
  user.resetTokenExpiry = null;

  await user.save();

  res.json({ msg: "Password reset successful ✅" });
});


module.exports = router;
