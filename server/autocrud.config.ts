export default {
  server: { 
    port: 5000, 
    basePath: "/api", 
    graphqlPath: "/graphql",
    existingApp: true // We'll pass an existing Express app
  },
  database: { 
    type: "file", 
    url: "./data" 
  },
  schemas: {
    user: { 
      file: "./schemas/user.json"
    },
    product: { 
      file: "./schemas/product.json" 
    },
    order: { 
      file: "./schemas/order.json" 
    },
    schema: { 
      file: "./schemas/schema.json" 
    },
    metric: { 
      file: "./schemas/metric.json" 
    }
  },
  joins: {
    userOrders: { 
      base: "user", 
      relations: [
        { 
          schema: "order", 
          localField: "id", 
          foreignField: "userId", 
          as: "orders", 
          type: "left" 
        }
      ] 
    },
    orderDetails: {
      base: "order",
      relations: [
        {
          schema: "user",
          localField: "userId", 
          foreignField: "id",
          as: "user",
          type: "left"
        },
        {
          schema: "product",
          localField: "productId",
          foreignField: "id", 
          as: "product",
          type: "left"
        }
      ]
    }
  },
  cache: { 
    enabled: true, 
    ttl: 60 
  },
  functional: { 
    enabled: true 
  }
};