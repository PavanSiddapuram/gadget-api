require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const gadgetsRouter = require("./routes/gadgets");
const authRouter = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Documentation
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/gadgets", gadgetsRouter); // Already includes authenticateJWT
app.use("/auth", authRouter);
app.use("/api", protectedRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the IMF Gadget API");
});

// Error Handling
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});