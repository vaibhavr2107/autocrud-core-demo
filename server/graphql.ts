import { gql } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { IStorage } from './storage';

// GraphQL type definitions
const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    email: String!
    name: String
    role: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Product {
    id: Int!
    name: String!
    price: Float!
    description: String
    category: String
    inStock: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type Order {
    id: ID!
    userId: String
    productId: Int
    quantity: Int!
    total: Float!
    status: String
    createdAt: Date!
    updatedAt: Date!
    user: User
    product: Product
  }

  type Schema {
    id: ID!
    name: String!
    definition: String!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  input UserInput {
    email: String!
    name: String
    role: String
  }

  input ProductInput {
    name: String!
    price: Float!
    description: String
    category: String
    inStock: Boolean
  }

  input OrderInput {
    userId: String
    productId: Int
    quantity: Int!
    total: Float!
    status: String
  }

  input SchemaInput {
    name: String!
    definition: String!
    isActive: Boolean
  }

  type Query {
    # User queries
    user(id: ID!): User
    users: [User!]!
    userList(filter: UserFilter, pagination: Pagination): UserList!

    # Product queries
    product(id: Int!): Product
    products: [Product!]!
    productList(filter: ProductFilter, pagination: Pagination): ProductList!

    # Order queries
    order(id: ID!): Order
    orders: [Order!]!
    orderList(filter: OrderFilter, pagination: Pagination): OrderList!

    # Schema queries
    schema(id: ID!): Schema
    schemas: [Schema!]!
  }

  type Mutation {
    # User mutations
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean!

    # Product mutations
    createProduct(input: ProductInput!): Product!
    updateProduct(id: Int!, input: ProductInput!): Product
    deleteProduct(id: Int!): Boolean!

    # Order mutations
    createOrder(input: OrderInput!): Order!
    updateOrder(id: ID!, input: OrderInput!): Order
    deleteOrder(id: ID!): Boolean!

    # Schema mutations
    createSchema(input: SchemaInput!): Schema!
    updateSchema(id: ID!, input: SchemaInput!): Schema
    deleteSchema(id: ID!): Boolean!
  }

  # Filter types
  input UserFilter {
    role: StringFilter
    email: StringFilter
  }

  input ProductFilter {
    name: StringFilter
    category: StringFilter
    inStock: Boolean
    price: FloatFilter
  }

  input OrderFilter {
    userId: StringFilter
    status: StringFilter
    total: FloatFilter
  }

  input StringFilter {
    eq: String
    contains: String
    startsWith: String
  }

  input FloatFilter {
    eq: Float
    gt: Float
    lt: Float
    gte: Float
    lte: Float
  }

  input Pagination {
    limit: Int
    offset: Int
  }

  # List types
  type UserList {
    nodes: [User!]!
    totalCount: Int!
  }

  type ProductList {
    nodes: [Product!]!
    totalCount: Int!
  }

  type OrderList {
    nodes: [Order!]!
    totalCount: Int!
  }
`;

// Create resolvers
export const createResolvers = (storage: IStorage) => ({
  Date: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value),
  },

  Query: {
    // User queries
    user: async (_: any, { id }: { id: string }) => {
      return await storage.getUser(id);
    },
    users: async () => {
      return await storage.listUsers();
    },
    userList: async (_: any, { filter, pagination }: { filter?: any, pagination?: any }) => {
      const users = await storage.listUsers();
      let filteredUsers = users;

      // Apply filters
      if (filter?.role?.eq) {
        filteredUsers = filteredUsers.filter((user: any) => user.role === filter.role.eq);
      }
      if (filter?.email?.contains) {
        filteredUsers = filteredUsers.filter((user: any) => 
          user.email.toLowerCase().includes(filter.email.contains.toLowerCase())
        );
      }

      // Apply pagination
      const offset = pagination?.offset || 0;
      const limit = pagination?.limit || filteredUsers.length;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);

      return {
        nodes: paginatedUsers,
        totalCount: filteredUsers.length,
      };
    },

    // Product queries
    product: async (_: any, { id }: { id: number }) => {
      return await storage.getProduct(id);
    },
    products: async () => {
      return await storage.listProducts();
    },
    productList: async (_: any, { filter, pagination }: { filter?: any, pagination?: any }) => {
      const products = await storage.listProducts();
      let filteredProducts = products;

      // Apply filters
      if (filter?.category?.eq) {
        filteredProducts = filteredProducts.filter((product: any) => product.category === filter.category.eq);
      }
      if (filter?.name?.contains) {
        filteredProducts = filteredProducts.filter((product: any) => 
          product.name.toLowerCase().includes(filter.name.contains.toLowerCase())
        );
      }
      if (typeof filter?.inStock === 'boolean') {
        filteredProducts = filteredProducts.filter((product: any) => product.inStock === filter.inStock);
      }

      // Apply pagination
      const offset = pagination?.offset || 0;
      const limit = pagination?.limit || filteredProducts.length;
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);

      return {
        nodes: paginatedProducts,
        totalCount: filteredProducts.length,
      };
    },

    // Order queries
    order: async (_: any, { id }: { id: string }) => {
      return await storage.getOrder(id);
    },
    orders: async () => {
      return await storage.listOrders();
    },
    orderList: async (_: any, { filter, pagination }: { filter?: any, pagination?: any }) => {
      const orders = await storage.listOrders();
      let filteredOrders = orders;

      // Apply filters
      if (filter?.status?.eq) {
        filteredOrders = filteredOrders.filter((order: any) => order.status === filter.status.eq);
      }
      if (filter?.userId?.eq) {
        filteredOrders = filteredOrders.filter((order: any) => order.userId === filter.userId.eq);
      }

      // Apply pagination
      const offset = pagination?.offset || 0;
      const limit = pagination?.limit || filteredOrders.length;
      const paginatedOrders = filteredOrders.slice(offset, offset + limit);

      return {
        nodes: paginatedOrders,
        totalCount: filteredOrders.length,
      };
    },

    // Schema queries
    schema: async (_: any, { id }: { id: string }) => {
      return await storage.getSchema(id);
    },
    schemas: async () => {
      return await storage.listSchemas();
    },
  },

  Mutation: {
    // User mutations
    createUser: async (_: any, { input }: { input: any }) => {
      return await storage.createUser(input);
    },
    updateUser: async (_: any, { id, input }: { id: string, input: any }) => {
      return await storage.updateUser(id, input);
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      return await storage.deleteUser(id);
    },

    // Product mutations
    createProduct: async (_: any, { input }: { input: any }) => {
      return await storage.createProduct(input);
    },
    updateProduct: async (_: any, { id, input }: { id: number, input: any }) => {
      return await storage.updateProduct(id, input);
    },
    deleteProduct: async (_: any, { id }: { id: number }) => {
      return await storage.deleteProduct(id);
    },

    // Order mutations
    createOrder: async (_: any, { input }: { input: any }) => {
      return await storage.createOrder(input);
    },
    updateOrder: async (_: any, { id, input }: { id: string, input: any }) => {
      return await storage.updateOrder(id, input);
    },
    deleteOrder: async (_: any, { id }: { id: string }) => {
      return await storage.deleteOrder(id);
    },

    // Schema mutations
    createSchema: async (_: any, { input }: { input: any }) => {
      return await storage.createSchema(input);
    },
    updateSchema: async (_: any, { id, input }: { id: string, input: any }) => {
      return await storage.updateSchema(id, input);
    },
    deleteSchema: async (_: any, { id }: { id: string }) => {
      return await storage.deleteSchema(id);
    },
  },

  // Relationship resolvers for Order
  Order: {
    user: async (parent: any, _: any, { storage }: { storage: IStorage }) => {
      if (!parent.userId) return null;
      return await storage.getUser(parent.userId);
    },
    product: async (parent: any, _: any, { storage }: { storage: IStorage }) => {
      if (!parent.productId) return null;
      return await storage.getProduct(parent.productId);
    },
  },
});

// Create and export the GraphQL schema
export const createGraphQLSchema = (storage: IStorage) => {
  return makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(storage),
  });
};