import { apiRequest } from "./queryClient";
import type { 
  User, 
  Product, 
  Order, 
  Schema, 
  Metric,
  InsertUser,
  InsertProduct,
  InsertOrder,
  InsertSchema,
  UserWithOrders,
  OrderWithDetails
} from "@shared/schema";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ListParams {
  limit?: number;
  offset?: number;
  withDetails?: boolean;
}

export interface MetricsSummary {
  averageResponseTime: number;
  cacheHitRate: number;
  requestsPerSecond: number;
}

export interface AutoCRUDInfo {
  version: string;
  features: string[];
  adapters: string[];
  endpoints: {
    rest: string[];
    graphql: string;
    joins: string[];
  };
}

/**
 * Service class for interacting with AutoCRUD Core APIs
 * Provides typed methods for all CRUD operations and meta endpoints
 */
export class AutoCRUDService {
  
  // User operations
  async getUsers(params?: ListParams): Promise<User[]> {
    const url = new URL('/api/user', window.location.origin);
    if (params?.limit) url.searchParams.set('limit', params.limit.toString());
    if (params?.offset) url.searchParams.set('offset', params.offset.toString());
    
    const response = await apiRequest('GET', url.pathname + url.search);
    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const response = await apiRequest('GET', `/api/user/${id}`);
    return response.json();
  }

  async createUser(user: InsertUser): Promise<User> {
    const response = await apiRequest('POST', '/api/user', user);
    return response.json();
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const response = await apiRequest('PATCH', `/api/user/${id}`, user);
    return response.json();
  }

  async deleteUser(id: string): Promise<void> {
    await apiRequest('DELETE', `/api/user/${id}`);
  }

  // Product operations
  async getProducts(params?: ListParams): Promise<Product[]> {
    const url = new URL('/api/product', window.location.origin);
    if (params?.limit) url.searchParams.set('limit', params.limit.toString());
    if (params?.offset) url.searchParams.set('offset', params.offset.toString());
    
    const response = await apiRequest('GET', url.pathname + url.search);
    return response.json();
  }

  async getProduct(id: number): Promise<Product> {
    const response = await apiRequest('GET', `/api/product/${id}`);
    return response.json();
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const response = await apiRequest('POST', '/api/product', product);
    return response.json();
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const response = await apiRequest('PATCH', `/api/product/${id}`, product);
    return response.json();
  }

  async deleteProduct(id: number): Promise<void> {
    await apiRequest('DELETE', `/api/product/${id}`);
  }

  // Order operations
  async getOrders(params?: ListParams): Promise<Order[] | OrderWithDetails[]> {
    const url = new URL('/api/order', window.location.origin);
    if (params?.limit) url.searchParams.set('limit', params.limit.toString());
    if (params?.offset) url.searchParams.set('offset', params.offset.toString());
    if (params?.withDetails) url.searchParams.set('withDetails', 'true');
    
    const response = await apiRequest('GET', url.pathname + url.search);
    return response.json();
  }

  async getOrder(id: string, withDetails = false): Promise<Order | OrderWithDetails> {
    const url = new URL(`/api/order/${id}`, window.location.origin);
    if (withDetails) url.searchParams.set('withDetails', 'true');
    
    const response = await apiRequest('GET', url.pathname + url.search);
    return response.json();
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const response = await apiRequest('POST', '/api/order', order);
    return response.json();
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const response = await apiRequest('PATCH', `/api/order/${id}`, order);
    return response.json();
  }

  async deleteOrder(id: string): Promise<void> {
    await apiRequest('DELETE', `/api/order/${id}`);
  }

  // Schema operations
  async getSchemas(): Promise<Schema[]> {
    const response = await apiRequest('GET', '/api/schema');
    return response.json();
  }

  async getSchema(id: string): Promise<Schema> {
    const response = await apiRequest('GET', `/api/schema/${id}`);
    return response.json();
  }

  async createSchema(schema: InsertSchema): Promise<Schema> {
    const response = await apiRequest('POST', '/api/schema', schema);
    return response.json();
  }

  async updateSchema(id: string, schema: Partial<InsertSchema>): Promise<Schema> {
    const response = await apiRequest('PATCH', `/api/schema/${id}`, schema);
    return response.json();
  }

  async deleteSchema(id: string): Promise<void> {
    await apiRequest('DELETE', `/api/schema/${id}`);
  }

  // Metrics operations
  async getMetrics(limit = 100): Promise<Metric[]> {
    const response = await apiRequest('GET', `/api/metric?limit=${limit}`);
    return response.json();
  }

  async getMetricsSummary(): Promise<MetricsSummary> {
    const response = await apiRequest('GET', '/api/metric/summary');
    return response.json();
  }

  // Join operations
  async getUserWithOrders(userId: string): Promise<UserWithOrders> {
    const response = await apiRequest('GET', `/api/join/userOrders?userId=${userId}`);
    return response.json();
  }

  // Meta operations
  async getAutoCRUDInfo(): Promise<AutoCRUDInfo> {
    const response = await apiRequest('GET', '/api/autocrud/info');
    return response.json();
  }

  // GraphQL operation
  async executeGraphQL(query: string, variables?: any): Promise<any> {
    const response = await apiRequest('POST', '/graphql', {
      query,
      variables,
    });
    return response.json();
  }

  // Utility methods
  async testConnection(): Promise<{ status: string; timestamp: string }> {
    try {
      const info = await this.getAutoCRUDInfo();
      return {
        status: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Batch operations
  async batchCreateUsers(users: InsertUser[]): Promise<User[]> {
    const results = await Promise.all(
      users.map(user => this.createUser(user))
    );
    return results;
  }

  async batchCreateProducts(products: InsertProduct[]): Promise<Product[]> {
    const results = await Promise.all(
      products.map(product => this.createProduct(product))
    );
    return results;
  }

  // Search and filtering helpers
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    // Note: This would typically use a search endpoint
    // For now, we'll get all users and filter client-side
    const users = await this.getUsers({ limit: 100 });
    return users.filter(user => 
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.name?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
  }

  async getProductsByCategory(category: string, limit = 10): Promise<Product[]> {
    // Note: This would typically use query parameters for filtering
    const products = await this.getProducts({ limit: 100 });
    return products.filter(product => 
      product.category?.toLowerCase() === category.toLowerCase()
    ).slice(0, limit);
  }
}

// Export singleton instance
export const autoCRUDService = new AutoCRUDService();

// Export individual service methods for convenience
export const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getSchemas,
  getSchema,
  createSchema,
  updateSchema,
  deleteSchema,
  getMetrics,
  getMetricsSummary,
  getUserWithOrders,
  getAutoCRUDInfo,
  executeGraphQL,
} = autoCRUDService;
