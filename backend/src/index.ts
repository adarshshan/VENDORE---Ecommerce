import "dotenv/config";
import express, { Express } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { connectToDatabase } from "./config/database";
import { ProductRepository } from "./repositories/ProductRepository";
import { ProductService } from "./services/ProductService";
import { productRoutes } from "./routes/ProductRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize ProductService and ProductRepository
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

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
      }),
    })
  );

  // Keep REST routes if you want to support both REST and GraphQL
  app.use("/api/products", productRoutes);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `GraphQL endpoint available at http://localhost:${PORT}/graphql`
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
      error
    );
    process.exit(1);
  });
