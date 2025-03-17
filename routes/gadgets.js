const express = require("express");
const crypto = require("crypto");
const prisma = require("../prismaClient");
const router = express.Router();
const { authenticateJWT } = require("../middleware/authMiddleware");


// Utility function to generate a random success probability
const generateSuccessProbability = () => `${Math.floor(Math.random() * 100) + 1}% success probability`;

// GET /gadgets - Retrieve all gadgets
router.get("/", async (req, res) => {
    try {
        const gadgets = await prisma.gadget.findMany();
        const gadgetsWithProbability = gadgets.map(gadget => ({
            ...gadget,
            successProbability: generateSuccessProbability()
        }));

        res.json(gadgetsWithProbability);
    } catch (error) {
        console.error("Error fetching gadgets:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST: Add a new gadget
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Gadget name is required." });
        }

        const newGadget = await prisma.gadget.create({
            data: {
                name,
                status: "Available",
                id: crypto.randomUUID(), // Ensure a unique UUID
            },
        });

        res.status(201).json({ message: "Gadget added successfully!", gadget: newGadget });
    } catch (error) {
        console.error("Error adding gadget:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


const generateSelfDestructCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST: Self-destruct a gadget
router.post("/:id/self-destruct", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const confirmationCode = generateSelfDestructCode();

        const destroyedGadget = await prisma.gadget.update({
            where: { id },
            data: {
                status: "Destroyed",
            },
        });

        res.json({
            message: `Self-destruct sequence initiated! Confirmation code: ${confirmationCode}`,
            gadget: destroyedGadget,
        });
    } catch (error) {
        console.error("Error triggering self-destruct:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch("/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;

        const updatedGadget = await prisma.gadget.update({
            where: { id },
            data: { name, status },
        });

        res.json({ message: "Gadget updated successfully!", gadget: updatedGadget });
    } catch (error) {
        console.error("Error updating gadget:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;

        const decommissionedGadget = await prisma.gadget.update({
            where: { id },
            data: {
                status: "Decommissioned",
                decommissionedAt: new Date(),
            },
        });

        res.json({ message: "Gadget decommissioned successfully!", gadget: decommissionedGadget });
    } catch (error) {
        console.error("Error decommissioning gadget:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;

