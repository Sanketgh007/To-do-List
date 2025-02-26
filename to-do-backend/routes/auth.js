const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const router = express.Router();

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again later"
});

// Input validation rules
const registerValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidationRules = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// ✅ REGISTER endpoint
router.post('/register', registerValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("Error in registration:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN endpoint
router.post('/login', loginLimiter, loginValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;