const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const router = express.Router();
const { authenticateJWT } = require("../middleware/authMiddleware");
require("dotenv").config();  // Load environment variables

//  User Signup
router.post("/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email: req.body.email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const newUser = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Signup failed!" });
    }
});

//  User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed!" });
    }
});

//  Get User Info (Protected)
router.get("/me", authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });
        
        res.json(user);
    } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

module.exports = router;
