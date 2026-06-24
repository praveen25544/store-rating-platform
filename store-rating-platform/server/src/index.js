import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import storeRoutes from "./routes/stores.js";
import ownerRoutes from "./routes/owner.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/owner", ownerRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((error, req, res, next) => {
  if (error.code === "P2002") {
    return res.status(409).json({ message: "Email already exists." });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ message: "Record not found." });
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
