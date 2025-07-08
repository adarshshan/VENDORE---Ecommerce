import { GraphQLClient } from "graphql-request";

const graphqlClient = new GraphQLClient(
  `${import.meta.env.VITE_GRAPHQL_BASEURL}`
);

export default graphqlClient;
