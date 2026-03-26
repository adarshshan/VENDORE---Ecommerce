import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/database";
import { productRoutes } from "./routes/ProductRoutes";
import { userRoutes } from "./routes/UserRoutes";
import { orderRoutes } from "./routes/OrderRoutes";
import { adminRoutes } from "./routes/AdminRoutes";
import { categoryRoutes } from "./routes/CategoryRoutes";
import { contactRoutes } from "./routes/ContactRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://172.26.58.12:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Set up REST Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);

// Start Server
const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`REST API endpoints available at http://localhost:${PORT}/api`);
  });
};

// Connect to MongoDB before starting the server
connectToDatabase()
  .then(() => {
    startServer();
  })
  .catch((error) => {
    console.error(
      "Failed to start server due to database connection error",
      error,
    );
    process.exit(1);
  });
