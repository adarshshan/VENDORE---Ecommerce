import "dotenv/config";
import express, { Express } from "express";
import { connectToDatabase } from "./config/database";
import { productRoutes } from "./routes/ProductRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Connect to MongoDB before starting the server and registering routes
connectToDatabase()
  .then(() => {
    // Register routes only after DB connection is established
    app.use("/api/products", productRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(
      "Failed to start server due to database connection error",
      error
    );
    process.exit(1);
  });
