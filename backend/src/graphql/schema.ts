import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Product {
    _id: ID!
    name: String!
    price: Float!
    description: String!
    stock: Int!
  }

  input ProductInput {
    name: String!
    price: Float!
    description: String!
    stock: Int!
  }

  input ProductUpdateInput {
    name: String
    price: Float
    description: String
    stock: Int
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductUpdateInput!): Product
    deleteProduct(id: ID!): Boolean!
  }
`;
