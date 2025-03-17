const express = require("express");
const { authenticateJWT } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", authenticateJWT, (req, res) => {
    res.json({ message: "Access granted to protected route!", user: req.user });
});

module.exports = router;
