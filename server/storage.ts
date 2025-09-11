import { 
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Schema, type InsertSchema,
  type Metric, type InsertMetric,
  type UserWithOrders,
  type OrderWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  listUsers(limit?: number, offset?: number): Promise<User[]>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  listProducts(limit?: number, offset?: number): Promise<Product[]>;
  
  // Orders
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  listOrders(limit?: number, offset?: number): Promise<Order[]>;
  
  // Schemas
  getSchema(id: string): Promise<Schema | undefined>;
  getSchemaByName(name: string): Promise<Schema | undefined>;
  createSchema(schema: InsertSchema): Promise<Schema>;
  updateSchema(id: string, schema: Partial<InsertSchema>): Promise<Schema | undefined>;
  deleteSchema(id: string): Promise<boolean>;
  listSchemas(): Promise<Schema[]>;
  
  // Metrics
  createMetric(metric: InsertMetric): Promise<Metric>;
  getMetrics(limit?: number): Promise<Metric[]>;
  getAverageResponseTime(): Promise<number>;
  getCacheHitRate(): Promise<number>;
  getRequestsPerSecond(): Promise<number>;
  
  // Joins
  getUserWithOrders(userId: string): Promise<UserWithOrders | undefined>;
  getOrderWithDetails(orderId: string): Promise<OrderWithDetails | undefined>;
  listOrdersWithDetails(limit?: number, offset?: number): Promise<OrderWithDetails[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<number, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private schemas: Map<string, Schema> = new Map();
  private metrics: Metric[] = [];
  private productIdCounter = 100;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed users
    const demoUsers: User[] = [
      {
        id: "user-1",
        email: "john@example.com",
        name: "John Doe",
        role: "admin",
        createdAt: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-15T10:30:00Z"),
      },
      {
        id: "user-2", 
        email: "jane@example.com",
        name: "Jane Smith",
        role: "user",
        createdAt: new Date("2024-01-15T11:15:00Z"),
        updatedAt: new Date("2024-01-15T11:15:00Z"),
      },
    ];

    demoUsers.forEach(user => this.users.set(user.id, user));

    // Seed products
    const demoProducts: Product[] = [
      {
        id: 101,
        name: "Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 19999, // $199.99
        category: "Electronics",
        inStock: true,
        createdAt: new Date("2024-01-10T09:00:00Z"),
        updatedAt: new Date("2024-01-10T09:00:00Z"),
      },
      {
        id: 102,
        name: "Gaming Mouse",
        description: "Precision gaming mouse with RGB lighting",
        price: 7999, // $79.99
        category: "Electronics",
        inStock: true,
        createdAt: new Date("2024-01-10T10:00:00Z"),
        updatedAt: new Date("2024-01-10T10:00:00Z"),
      },
    ];

    demoProducts.forEach(product => this.products.set(product.id, product));
    this.productIdCounter = Math.max(...demoProducts.map(p => p.id)) + 1;

    // Seed orders
    const demoOrders: Order[] = [
      {
        id: "order-1",
        userId: "user-1",
        productId: 101,
        quantity: 1,
        totalAmount: 19999,
        status: "completed",
        createdAt: new Date("2024-01-16T14:30:00Z"),
        updatedAt: new Date("2024-01-16T15:00:00Z"),
      },
    ];

    demoOrders.forEach(order => this.orders.set(order.id, order));

    // Seed default schemas
    const defaultSchemas: Schema[] = [
      {
        id: "schema-user",
        name: "user",
        definition: {
          name: "user",
          primaryKey: { name: "id", auto: true, strategy: "uuid", type: "string" },
          timestamps: true,
          fields: {
            id: { type: "string", required: true },
            email: { type: "string", required: true },
            name: { type: "string" },
            role: { type: "string", default: "user" }
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "schema-product",
        name: "product",
        definition: {
          name: "product",
          primaryKey: { name: "id", auto: true, strategy: "sequence", type: "number", start: 100, step: 1 },
          timestamps: true,
          fields: {
            id: { type: "number", required: true },
            name: { type: "string", required: true },
            description: { type: "string" },
            price: { type: "number", required: true },
            category: { type: "string" },
            inStock: { type: "boolean", default: true }
          }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultSchemas.forEach(schema => this.schemas.set(schema.id, schema));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated: User = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async listUsers(limit = 50, offset = 0): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    return allUsers.slice(offset, offset + limit);
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async listProducts(limit = 50, offset = 0): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    return allProducts.slice(offset, offset + limit);
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updateData: Partial<InsertOrder>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated: Order = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }

  async listOrders(limit = 50, offset = 0): Promise<Order[]> {
    const allOrders = Array.from(this.orders.values());
    return allOrders.slice(offset, offset + limit);
  }

  // Schema methods
  async getSchema(id: string): Promise<Schema | undefined> {
    return this.schemas.get(id);
  }

  async getSchemaByName(name: string): Promise<Schema | undefined> {
    return Array.from(this.schemas.values()).find(schema => schema.name === name);
  }

  async createSchema(insertSchema: InsertSchema): Promise<Schema> {
    const id = randomUUID();
    const now = new Date();
    const schema: Schema = { 
      ...insertSchema, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.schemas.set(id, schema);
    return schema;
  }

  async updateSchema(id: string, updateData: Partial<InsertSchema>): Promise<Schema | undefined> {
    const existing = this.schemas.get(id);
    if (!existing) return undefined;
    
    const updated: Schema = { 
      ...existing, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.schemas.set(id, updated);
    return updated;
  }

  async deleteSchema(id: string): Promise<boolean> {
    return this.schemas.delete(id);
  }

  async listSchemas(): Promise<Schema[]> {
    return Array.from(this.schemas.values());
  }

  // Metrics methods
  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const metric: Metric = { 
      ...insertMetric, 
      id: randomUUID(), 
      timestamp: new Date() 
    };
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    return metric;
  }

  async getMetrics(limit = 100): Promise<Metric[]> {
    return this.metrics.slice(-limit).reverse();
  }

  async getAverageResponseTime(): Promise<number> {
    if (this.metrics.length === 0) return 12; // Default demo value
    const total = this.metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return Math.round(total / this.metrics.length);
  }

  async getCacheHitRate(): Promise<number> {
    if (this.metrics.length === 0) return 94; // Default demo value
    const hits = this.metrics.filter(metric => metric.cacheHit).length;
    return Math.round((hits / this.metrics.length) * 100);
  }

  async getRequestsPerSecond(): Promise<number> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const recentMetrics = this.metrics.filter(
      metric => metric.timestamp && metric.timestamp.getTime() >= oneSecondAgo
    );
    return recentMetrics.length || 1250; // Default demo value
  }

  // Join methods
  async getUserWithOrders(userId: string): Promise<UserWithOrders | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);
    
    const ordersWithProducts = await Promise.all(
      userOrders.map(async order => {
        const product = await this.getProduct(order.productId!);
        return { ...order, product: product! };
      })
    );

    return { ...user, orders: ordersWithProducts };
  }

  async getOrderWithDetails(orderId: string): Promise<OrderWithDetails | undefined> {
    const order = await this.getOrder(orderId);
    if (!order) return undefined;

    const user = await this.getUser(order.userId!);
    const product = await this.getProduct(order.productId!);

    if (!user || !product) return undefined;

    return { ...order, user, product };
  }

  async listOrdersWithDetails(limit = 50, offset = 0): Promise<OrderWithDetails[]> {
    const orders = await this.listOrders(limit, offset);
    
    const ordersWithDetails = await Promise.all(
      orders.map(async order => {
        const user = await this.getUser(order.userId!);
        const product = await this.getProduct(order.productId!);
        return { ...order, user: user!, product: product! };
      })
    );

    return ordersWithDetails.filter(order => order.user && order.product);
  }
}

export const storage = new MemStorage();
