import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { connectToDatabase } from "./config/database";
import { ProductRepository } from "./repositories/ProductRepository";
import { productRoutes } from "./routes/ProductRoutes";
import { UserRepository } from "./repositories/UserRepository";
import { userRoutes } from "./routes/UserRoutes";
import { orderRoutes } from "./routes/OrderRoutes";
import { adminRoutes } from "./routes/AdminRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Repositories
const productRepository = new ProductRepository();
const userRepository = new UserRepository();

// Set up REST Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

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
