const express = require("express");
const crypto = require("crypto");
const { check, validationResult } = require("express-validator");
const prisma = require("../prismaClient");
const router = express.Router();
const { authenticateJWT } = require("../middleware/authMiddleware");

// Utility function to generate a random success probability
const generateSuccessProbability = () => `${Math.floor(Math.random() * 100) + 1}% success probability`;

// Utility function to generate a random codename
const codenames = ["Nightingale", "Kraken", "Spectre", "Phantom", "Viper", "Eclipse"];
const generateCodename = () => `The ${codenames[Math.floor(Math.random() * codenames.length)]}`;

// GET /gadgets - Retrieve all gadgets or filter by status
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    if (status && !["Available", "Deployed", "Destroyed", "Decommissioned"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const gadgets = await prisma.gadget.findMany({ where });
    const gadgetsWithProbability = gadgets.map(gadget => ({
      ...gadget,
      successProbability: generateSuccessProbability(),
    }));

    res.json(gadgetsWithProbability);
  } catch (error) {
    console.error("Error fetching gadgets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST: Add a new gadget
router.post(
  "/",
  authenticateJWT,
  [check("name").optional().isString().trim().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name } = req.body;
      const gadgetName = name || generateCodename();

      const newGadget = await prisma.gadget.create({
        data: {
          name: gadgetName,
          status: "Available",
        },
      });

      res.status(201).json({ message: "Gadget added successfully!", gadget: newGadget });
    } catch (error) {
      console.error("Error adding gadget:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// PATCH: Update a gadget
router.patch(
  "/:id",
  authenticateJWT,
  [
    check("name").optional().isString().trim().notEmpty(),
    check("status")
      .optional()
      .isIn(["Available", "Deployed", "Destroyed", "Decommissioned"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

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
  }
);

// DELETE: Decommission a gadget
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

// POST: Self-destruct a gadget
const generateSelfDestructCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

module.exports = router;