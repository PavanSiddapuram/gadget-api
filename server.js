require("dotenv").config();
const express = require("express");
const cors = require("cors");
const gadgetsRouter = require("./routes/gadgets");
const authRouter = require("./routes/auth");
const { authenticateJWT } = require("./middleware/authMiddleware"); 


const app = express();
app.use(cors());
app.use(express.json());

app.use("/gadgets", authenticateJWT, gadgetsRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Gadget API");
});

const protectedRoutes = require("./routes/protected");
app.use("/api", protectedRoutes);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
