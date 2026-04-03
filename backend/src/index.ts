import dotenv from "dotenv";
dotenv.config();
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
import { wishlistRoutes } from "./routes/WishlistRoutes";
import { searchRoutes } from "./routes/SearchRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://172.26.58.12:5173",
  "https://vendore-ecommerce-25oft3ddx-adarshshans-projects.vercel.app",
  "https://vendore-ecommerce-3dl2ymo20-adarshshans-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

// Allow Google Auth popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.get("/health-check", (req, res) => {
  res.send(`The application is running on port ${PORT}`);
});

// Set up REST Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/search", searchRoutes);

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
