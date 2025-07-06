import { Product } from "../models/products";
import { ProductService } from "../services/ProductService";

interface Context {
  productService: ProductService;
}

export const resolvers = {
  Query: {
    products: async (_: any, __: any, context: Context) => {
      return context.productService.getAllProducts();
    },
    product: async (_: any, { id }: { id: string }, context: Context) => {
      return context.productService.getProductById(id);
    },
  },
  Mutation: {
    createProduct: async (
      _: any,
      { input }: { input: Omit<Product, "_id"> },
      context: Context
    ) => {
      return context.productService.createProduct(input);
    },
    updateProduct: async (
      _: any,
      { id, input }: { id: string; input: Partial<Product> },
      context: Context
    ) => {
      return context.productService.updateProduct(id, input);
    },
    deleteProduct: async (_: any, { id }: { id: String }, context: Context) => {
      return context.productService.deleteProduct(id as string);
    },
  },
};
