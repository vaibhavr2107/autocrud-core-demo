import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertSchemaSchema, insertMetricSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to track metrics
  app.use("/api", async (req, res, next) => {
    const start = Date.now();
    
    res.on("finish", async () => {
      const responseTime = Date.now() - start;
      const cacheHit = Math.random() > 0.06; // Simulate 94% cache hit rate
      
      await storage.createMetric({
        endpoint: req.path,
        method: req.method,
        responseTime,
        cacheHit,
      });
    });
    
    next();
  });

  // Users endpoints
  app.get("/api/users", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await storage.listUsers(limit, offset);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const products = await storage.listProducts(limit, offset);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, updateData);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders endpoints
  app.get("/api/orders", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const withDetails = req.query.withDetails === "true";
      
      if (withDetails) {
        const orders = await storage.listOrdersWithDetails(limit, offset);
        res.json(orders);
      } else {
        const orders = await storage.listOrders(limit, offset);
        res.json(orders);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const withDetails = req.query.withDetails === "true";
      
      if (withDetails) {
        const order = await storage.getOrderWithDetails(req.params.id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
      } else {
        const order = await storage.getOrder(req.params.id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const updateData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(req.params.id, updateData);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  // Schemas endpoints
  app.get("/api/schemas", async (req, res) => {
    try {
      const schemas = await storage.listSchemas();
      res.json(schemas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schemas" });
    }
  });

  app.get("/api/schemas/:id", async (req, res) => {
    try {
      const schema = await storage.getSchema(req.params.id);
      if (!schema) {
        return res.status(404).json({ error: "Schema not found" });
      }
      res.json(schema);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schema" });
    }
  });

  app.post("/api/schemas", async (req, res) => {
    try {
      const schemaData = insertSchemaSchema.parse(req.body);
      const schema = await storage.createSchema(schemaData);
      res.status(201).json(schema);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid schema data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create schema" });
    }
  });

  app.patch("/api/schemas/:id", async (req, res) => {
    try {
      const updateData = insertSchemaSchema.partial().parse(req.body);
      const schema = await storage.updateSchema(req.params.id, updateData);
      if (!schema) {
        return res.status(404).json({ error: "Schema not found" });
      }
      res.json(schema);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid schema data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update schema" });
    }
  });

  app.delete("/api/schemas/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSchema(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Schema not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete schema" });
    }
  });

  // Metrics endpoints
  app.get("/api/metrics", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const metrics = await storage.getMetrics(limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/metrics/summary", async (req, res) => {
    try {
      const [avgResponseTime, cacheHitRate, requestsPerSecond] = await Promise.all([
        storage.getAverageResponseTime(),
        storage.getCacheHitRate(),
        storage.getRequestsPerSecond(),
      ]);

      res.json({
        averageResponseTime: avgResponseTime,
        cacheHitRate: cacheHitRate,
        requestsPerSecond: requestsPerSecond,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metrics summary" });
    }
  });

  // Join endpoints
  app.get("/api/join/users/:id/orders", async (req, res) => {
    try {
      const userWithOrders = await storage.getUserWithOrders(req.params.id);
      if (!userWithOrders) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(userWithOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user with orders" });
    }
  });

  // AutoCRUD Info endpoints (meta endpoints about the library)
  app.get("/api/autocrud/info", async (req, res) => {
    try {
      res.json({
        version: "0.1.1",
        features: [
          "REST API generation",
          "GraphQL schema generation", 
          "Multiple database adapters",
          "Real-time metrics",
          "Schema hot-reload",
          "Caching layer",
          "Join operations"
        ],
        adapters: ["file", "sqlite", "postgres", "mongodb"],
        endpoints: {
          rest: [
            "GET /api/users",
            "POST /api/users", 
            "GET /api/users/:id",
            "PATCH /api/users/:id",
            "DELETE /api/users/:id",
            "GET /api/products",
            "POST /api/products",
            "GET /api/products/:id", 
            "PATCH /api/products/:id",
            "DELETE /api/products/:id",
            "GET /api/orders",
            "POST /api/orders",
            "GET /api/orders/:id",
            "PATCH /api/orders/:id", 
            "DELETE /api/orders/:id"
          ],
          graphql: "/graphql",
          joins: [
            "GET /api/join/users/:id/orders"
          ]
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AutoCRUD info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
