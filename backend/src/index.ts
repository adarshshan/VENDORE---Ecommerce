import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { connectToDatabase } from "./config/database";
import { ProductRepository } from "./repositories/ProductRepository";
import { ProductService } from "./services/ProductService";
import { productRoutes } from "./routes/ProductRoutes";
import { UserRepository } from "./repositories/UserRepository";
import { UserService } from "./services/UserService";
import { userRoutes } from "./routes/UserRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize ProductService and ProductRepository
const productRepository = new ProductRepository();
const userRepository = new UserRepository();

const productService = new ProductService(productRepository);
const userService = new UserService(userRepository);

// Set up Apollo Server
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async () => ({
        productService,
        userService,
      }),
    }),
  );

  // Keep REST routes if you want to support both REST and GraphQL
  app.use("/api/products", productRoutes);
  app.use("/api/users", userRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `GraphQL endpoint available at http://localhost:${PORT}/graphql`,
    );
  });
};

// Connect to MongoDB before starting the server
connectToDatabase()
  .then(() => {
    startApolloServer();
  })
  .catch((error) => {
    console.error(
      "Failed to start server due to database connection error",
      error,
    );
    process.exit(1);
  });
