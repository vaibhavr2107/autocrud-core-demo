import Navigation from "@/components/navigation/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Documentation() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <i className="fas fa-book mr-2"></i>
            v0.1.1 Documentation
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">AutoCRUD Core Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide for building auto-generated CRUD REST + GraphQL APIs from JSON schemas. 
            Built with TypeScript, Express.js, Apollo GraphQL, and Drizzle ORM.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="rest-api">REST API</TabsTrigger>
            <TabsTrigger value="graphql">GraphQL</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <i className="fas fa-info-circle text-primary mr-3"></i>
                  What is AutoCRUD Core?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  AutoCRUD Core is a full-stack library that automatically generates complete CRUD (Create, Read, Update, Delete) 
                  REST and GraphQL APIs from JSON schema definitions. It eliminates the need to manually write API endpoints, 
                  resolvers, and database queries.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">✨ Key Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• Auto-generated REST endpoints</li>
                      <li>• Auto-generated GraphQL queries & mutations</li>
                      <li>• Advanced filtering and pagination</li>
                      <li>• Real-time performance metrics</li>
                      <li>• Type-safe TypeScript schemas</li>
                      <li>• Multiple database adapter support</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">🛠 Tech Stack</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li>• <strong>Backend:</strong> Express.js + TypeScript</li>
                      <li>• <strong>GraphQL:</strong> Apollo Server Express</li>
                      <li>• <strong>Database:</strong> Drizzle ORM + PostgreSQL</li>
                      <li>• <strong>Validation:</strong> Zod schemas</li>
                      <li>• <strong>Frontend:</strong> React + TanStack Query</li>
                      <li>• <strong>UI:</strong> Tailwind CSS + shadcn/ui</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <i className="fas fa-layer-group text-green-500 mr-3"></i>
                  Architecture Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <i className="fas fa-database text-2xl text-blue-500 mb-3"></i>
                    <h4 className="font-semibold mb-2">Schema Definition</h4>
                    <p className="text-sm text-muted-foreground">
                      Define your data models using Drizzle ORM schemas with automatic validation
                    </p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <i className="fas fa-cogs text-2xl text-purple-500 mb-3"></i>
                    <h4 className="font-semibold mb-2">Auto Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      REST endpoints and GraphQL resolvers are automatically generated from schemas
                    </p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <i className="fas fa-globe text-2xl text-pink-500 mb-3"></i>
                    <h4 className="font-semibold mb-2">API Ready</h4>
                    <p className="text-sm text-muted-foreground">
                      Production-ready APIs with filtering, pagination, and observability built-in
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quickstart" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <i className="fas fa-rocket text-primary mr-3"></i>
                  Quick Start Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Install Dependencies</h3>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">npm install autocrud-core express drizzle-orm @neondatabase/serverless</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Define Your Schema</h3>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql\`gen_random_uuid()\`),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Setup Express Server</h3>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`import express from "express";
import { AutoCRUD } from "autocrud-core";
import { users } from "./schema";

const app = express();
app.use(express.json());

const autoCRUD = new AutoCRUD({
  database: db,
  schemas: { users },
});

// Auto-generate REST endpoints
app.use("/api", autoCRUD.restRouter());

// Auto-generate GraphQL endpoint
app.use("/graphql", autoCRUD.graphqlRouter());

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Start Building</h3>
                  <p className="text-muted-foreground mb-4">
                    Your APIs are now ready! Access REST endpoints at <code className="bg-muted px-2 py-1 rounded">/api/users</code> 
                    and GraphQL at <code className="bg-muted px-2 py-1 rounded">/graphql</code>.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => window.open('/dashboard', '_blank')} data-testid="button-try-live-demo">
                      <i className="fas fa-play mr-2"></i>
                      Try Live Demo
                    </Button>
                    <Button variant="outline" onClick={() => window.open('https://github.com/vaibhavr2107/autocrud', '_blank')} data-testid="button-view-source">
                      <i className="fab fa-github mr-2"></i>
                      View Source
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rest-api" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <i className="fas fa-globe text-primary mr-3"></i>
                  REST API Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  AutoCRUD Core automatically generates REST endpoints for all your schemas with full CRUD operations.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Available Endpoints</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Badge className="mr-3 bg-green-600">GET</Badge>
                          <code className="text-sm">/api/users</code>
                        </div>
                        <span className="text-xs text-muted-foreground">List all users</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Badge className="mr-3 bg-green-600">GET</Badge>
                          <code className="text-sm">/api/users/:id</code>
                        </div>
                        <span className="text-xs text-muted-foreground">Get user by ID</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Badge className="mr-3 bg-blue-600">POST</Badge>
                          <code className="text-sm">/api/users</code>
                        </div>
                        <span className="text-xs text-muted-foreground">Create new user</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-3">PATCH</Badge>
                          <code className="text-sm">/api/users/:id</code>
                        </div>
                        <span className="text-xs text-muted-foreground">Update user</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Badge variant="destructive" className="mr-3">DELETE</Badge>
                          <code className="text-sm">/api/users/:id</code>
                        </div>
                        <span className="text-xs text-muted-foreground">Delete user</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Query Parameters</h4>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Pagination</h5>
                        <div className="bg-muted p-3 rounded-lg code-font text-sm">
                          <pre className="text-foreground">GET /api/users?limit=10&offset=0</pre>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Filtering</h5>
                        <div className="bg-muted p-3 rounded-lg code-font text-sm">
                          <pre className="text-foreground">GET /api/users?role=admin&name=john</pre>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Sorting</h5>
                        <div className="bg-muted p-3 rounded-lg code-font text-sm">
                          <pre className="text-foreground">GET /api/users?sort=createdAt&order=desc</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Example Request & Response</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-2">POST /api/users</h5>
                      <div className="bg-muted p-4 rounded-lg code-font text-sm">
                        <pre className="text-foreground">{`{
  "email": "john@example.com",
  "name": "John Doe",
  "role": "admin"
}`}</pre>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Response</h5>
                      <div className="bg-muted p-4 rounded-lg code-font text-sm">
                        <pre className="text-foreground">{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "admin",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}`}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graphql" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <i className="fas fa-project-diagram text-pink-500 mr-3"></i>
                  GraphQL API Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  AutoCRUD Core automatically generates a complete GraphQL schema with queries, mutations, 
                  filters, and pagination for all your data models.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Generated Queries</h4>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`type Query {
  # Single record queries
  user(id: ID!): User
  product(id: Int!): Product
  order(id: ID!): Order
  
  # List queries with pagination
  userList(
    filter: UserFilter
    pagination: Pagination
  ): UserList!
  
  productList(
    filter: ProductFilter
    pagination: Pagination
  ): ProductList!
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-4">Generated Mutations</h4>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`type Mutation {
  # User mutations
  createUser(input: UserInput!): User!
  updateUser(id: ID!, input: UserInput!): User
  deleteUser(id: ID!): Boolean!
  
  # Product mutations
  createProduct(input: ProductInput!): Product!
  updateProduct(id: Int!, input: ProductInput!): Product
  deleteProduct(id: Int!): Boolean!
}`}</pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Advanced Filtering</h4>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`query GetFilteredUsers {
  userList(
    filter: {
      role: { eq: "admin" }
      email: { contains: "@company.com" }
    }
    pagination: { limit: 10, offset: 0 }
  ) {
    nodes {
      id
      email
      name
      role
      createdAt
    }
    totalCount
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Relationship Queries</h4>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`query GetOrdersWithDetails {
  orderList(pagination: { limit: 5 }) {
    nodes {
      id
      quantity
      total
      status
      user {
        id
        name
        email
      }
      product {
        id
        name
        price
        category
      }
    }
    totalCount
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Available Filter Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">String Filters</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <code>eq</code> - Exact match</li>
                        <li>• <code>contains</code> - Contains substring</li>
                        <li>• <code>startsWith</code> - Starts with string</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Number Filters</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <code>eq</code> - Equals</li>
                        <li>• <code>gt</code> - Greater than</li>
                        <li>• <code>lt</code> - Less than</li>
                        <li>• <code>gte</code> - Greater than or equal</li>
                        <li>• <code>lte</code> - Less than or equal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schemas" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <i className="fas fa-database text-primary mr-3"></i>
                  Schema Definition Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Learn how to define your data models using Drizzle ORM schemas with automatic validation and type generation.
                </p>

                <div>
                  <h4 className="font-semibold mb-4">Basic Schema Structure</h4>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql\`gen_random_uuid()\`),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generate Zod validation schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Supported Column Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium mb-3">Basic Types</h5>
                      <div className="space-y-2 text-sm">
                        <div><code className="bg-muted px-2 py-1 rounded">text()</code> - Variable length text</div>
                        <div><code className="bg-muted px-2 py-1 rounded">varchar(length)</code> - Fixed length text</div>
                        <div><code className="bg-muted px-2 py-1 rounded">integer()</code> - 32-bit integer</div>
                        <div><code className="bg-muted px-2 py-1 rounded">boolean()</code> - True/false values</div>
                        <div><code className="bg-muted px-2 py-1 rounded">timestamp()</code> - Date and time</div>
                        <div><code className="bg-muted px-2 py-1 rounded">json()</code> - JSON data</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-3">Constraints</h5>
                      <div className="space-y-2 text-sm">
                        <div><code className="bg-muted px-2 py-1 rounded">.notNull()</code> - Required field</div>
                        <div><code className="bg-muted px-2 py-1 rounded">.unique()</code> - Unique values</div>
                        <div><code className="bg-muted px-2 py-1 rounded">.default()</code> - Default value</div>
                        <div><code className="bg-muted px-2 py-1 rounded">.primaryKey()</code> - Primary key</div>
                        <div><code className="bg-muted px-2 py-1 rounded">.references()</code> - Foreign key</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Relationships Example</h4>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`// Products table
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  category: text("category"),
  inStock: boolean("in_stock").default(true),
});

// Orders table with foreign keys
export const orders = pgTable("orders", {
  id: text("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: text("user_id").references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending"),
});

// Join type for complex queries
export type OrderWithDetails = Order & {
  user: User;
  product: Product;
};`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Custom Validation</h4>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    email: z.string().email("Invalid email format"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    role: z.enum(["user", "admin", "moderator"]),
  });`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="mt-8 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <i className="fas fa-code text-primary mr-3"></i>
                  Real-World Examples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <i className="fas fa-users text-blue-500 mr-2"></i>
                        User Management System
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete user authentication and management with roles and permissions.
                      </p>
                      <div className="bg-muted p-3 rounded-lg code-font text-xs">
                        <pre className="text-foreground">{`// Query users with role filtering
query GetAdmins {
  userList(filter: { role: { eq: "admin" } }) {
    nodes { id email name role }
    totalCount
  }
}`}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <i className="fas fa-shopping-cart text-green-500 mr-2"></i>
                        E-commerce Catalog
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Product catalog with inventory management and order tracking.
                      </p>
                      <div className="bg-muted p-3 rounded-lg code-font text-xs">
                        <pre className="text-foreground">{`// Get products in stock by category
query GetElectronics {
  productList(filter: { 
    category: { eq: "electronics" }
    inStock: true 
  }) {
    nodes { name price description }
  }
}`}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <i className="fas fa-chart-line text-purple-500 mr-2"></i>
                        Performance Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Built-in performance metrics and monitoring for API observability.
                      </p>
                      <div className="bg-muted p-3 rounded-lg code-font text-xs">
                        <pre className="text-foreground">{`// REST endpoint for metrics
GET /api/metrics?endpoint=/api/users
&method=GET&limit=100`}</pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <i className="fas fa-database text-orange-500 mr-2"></i>
                        Dynamic Schema Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Store and manage JSON schemas dynamically for flexible data models.
                      </p>
                      <div className="bg-muted p-3 rounded-lg code-font text-xs">
                        <pre className="text-foreground">{`// Create custom schema
mutation CreateSchema {
  createSchema(input: {
    name: "blog_posts"
    definition: "{\\"type\\": \\"object\\"...}"
  }) { id name isActive }
}`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center mt-8">
                  <Button onClick={() => window.open('/dashboard', '_blank')} size="lg" className="mr-4" data-testid="button-explore-examples">
                    <i className="fas fa-play mr-2"></i>
                    Explore Live Examples
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => window.open('https://github.com/vaibhavr2107/autocrud/tree/main/examples', '_blank')} data-testid="button-view-code-examples">
                    <i className="fab fa-github mr-2"></i>
                    View Code Examples
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}