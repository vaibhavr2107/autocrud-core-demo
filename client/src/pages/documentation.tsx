
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation/navigation";

export default function Documentation() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4">v0.1.4</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AutoCRUD Core Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to implementing auto-generated CRUD APIs with REST and GraphQL endpoints
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="schemas">Schemas</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>What is AutoCRUD Core?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  AutoCRUD Core is a powerful Node.js library that automatically generates complete CRUD REST and GraphQL APIs 
                  from simple JSON schema definitions. It eliminates boilerplate code and accelerates API development.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="font-semibold mb-3">✨ Key Features</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Auto-generated REST endpoints</li>
                      <li>• GraphQL schema and resolvers</li>
                      <li>• Multiple database adapters</li>
                      <li>• Built-in caching system</li>
                      <li>• Join operations support</li>
                      <li>• Performance metrics</li>
                      <li>• Hot-reload development</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">🔧 Supported Databases</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• File-based (JSON) - Default</li>
                      <li>• PostgreSQL</li>
                      <li>• SQLite (better-sqlite3)</li>
                      <li>• MongoDB</li>
                      <li>• MySQL (coming soon)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demo Application Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This demo application showcases AutoCRUD Core v0.1.4 with a minimal backend implementation using only 3 core files:
                </p>
                
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <Badge variant="outline" className="mr-2">server/index.ts</Badge>
                    <span className="text-sm text-muted-foreground">Express server setup with AutoCRUD integration</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="mr-2">server/autocrud.config.ts</Badge>
                    <span className="text-sm text-muted-foreground">AutoCRUD configuration with schemas and joins</span>
                  </div>
                  <div>
                    <Badge variant="outline" className="mr-2">server/vite.ts</Badge>
                    <span className="text-sm text-muted-foreground">Development server utilities and static serving</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">1. Install AutoCRUD Core</h3>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`npm install autocrud-core@0.1.4`}</pre>
                      <button 
                        className="ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => copyToClipboard('npm install autocrud-core@0.1.4')}
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">2. Install Database Adapter (Optional)</h3>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`# For SQLite support
npm install better-sqlite3

# For PostgreSQL support  
npm install pg @types/pg

# For MongoDB support
npm install mongodb`}</pre>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Note: File-based storage works out of the box without additional dependencies
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Basic Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">1. Create Schema Definition</h3>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`// schemas/user.json
{
  "name": "user",
  "primaryKey": { 
    "name": "id", 
    "auto": true, 
    "strategy": "uuid", 
    "type": "string" 
  },
  "timestamps": true,
  "fields": {
    "id": { "type": "string", "required": true },
    "email": { "type": "string", "required": true },
    "name": { "type": "string", "required": false },
    "role": { "type": "string", "default": "user" }
  }
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">2. Configure AutoCRUD</h3>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`// server/autocrud.config.ts
export default {
  server: { 
    port: 5000, 
    basePath: "/api", 
    graphqlPath: "/graphql"
  },
  database: { 
    type: "file", 
    url: "./data" 
  },
  schemas: {
    user: { file: "./schemas/user.json" }
  },
  cache: { 
    enabled: true, 
    ttl: 60 
  },
  functional: { 
    enabled: true 
  }
};`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">3. Setup Express Server</h3>
                    <div className="bg-muted p-4 rounded-lg code-font text-sm">
                      <pre className="text-foreground">{`// server/index.ts
import express from "express";
import { buildAutoCRUD } from "autocrud-core";
import config from "./autocrud.config";

const app = express();
app.use(express.json());

(async () => {
  // Initialize AutoCRUD with existing Express app
  const orch = await buildAutoCRUD({
    ...config,
    server: {
      ...config.server,
      existingApp: app
    }
  });
  
  // Start AutoCRUD (mounts routes to existing app)
  await orch.start();

  // Create HTTP server
  const { createServer } = await import("http");
  const server = createServer(app);

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(\`Server running on port \${port}\`);
    console.log(\`REST API: http://0.0.0.0:\${port}/api\`);
    console.log(\`GraphQL: http://0.0.0.0:\${port}/graphql\`);
  });
})();`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Complete Configuration Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg code-font text-sm">
                  <pre className="text-foreground">{`// Demo Application Configuration (server/autocrud.config.ts)
export default {
  server: { 
    port: 5000,                    // Server port
    basePath: "/api",              // API base path
    graphqlPath: "/graphql",       // GraphQL endpoint
    existingApp: true              // Use existing Express app
  },
  database: { 
    type: "file",                  // Database type: file, sqlite, postgres, mongo
    url: "./data"                  // Database connection string or path
  },
  schemas: {
    user: { file: "./schemas/user.json" },
    product: { file: "./schemas/product.json" },
    order: { file: "./schemas/order.json" },
    schema: { file: "./schemas/schema.json" },
    metric: { file: "./schemas/metric.json" }
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
    enabled: true,                 // Enable caching
    ttl: 60                        // Cache TTL in seconds
  },
  functional: { 
    enabled: true                  // Enable functional endpoints
  }
};`}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Configurations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">File-based Database (Default)</h3>
                  <div className="bg-muted p-3 rounded code-font text-sm">
                    <pre>{`database: { type: "file", url: "./data" }`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">PostgreSQL</h3>
                  <div className="bg-muted p-3 rounded code-font text-sm">
                    <pre>{`database: { 
  type: "postgres", 
  url: "postgresql://user:pass@host:5432/db" 
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">SQLite</h3>
                  <div className="bg-muted p-3 rounded code-font text-sm">
                    <pre>{`database: { 
  type: "sqlite", 
  url: "./database.sqlite" 
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">MongoDB</h3>
                  <div className="bg-muted p-3 rounded code-font text-sm">
                    <pre>{`database: { 
  type: "mongo", 
  url: "mongodb://localhost:27017/mydb" 
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schemas Tab */}
          <TabsContent value="schemas" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Schema Definition Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Schemas define your data structure and are the foundation of AutoCRUD Core. 
                  Each schema automatically generates CRUD endpoints and GraphQL types.
                </p>

                <div>
                  <h3 className="font-semibold mb-3">Basic Schema Structure</h3>
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground">{`{
  "name": "entity_name",           // Required: Entity name
  "primaryKey": {                  // Optional: Primary key configuration
    "name": "id",                  // Key field name
    "auto": true,                  // Auto-generate values
    "strategy": "uuid",            // Generation strategy: uuid, increment
    "type": "string"               // Data type
  },
  "timestamps": true,              // Optional: Auto createdAt/updatedAt
  "fields": {                      // Required: Field definitions
    "id": {
      "type": "string",            // Field type
      "required": true             // Validation rule
    },
    "name": {
      "type": "string",
      "required": false,
      "default": "Anonymous"       // Default value
    }
  }
}`}</pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Supported Field Types</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium mb-2">Primitive Types</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>string</code> - Text data</li>
                        <li>• <code>number</code> - Numeric data</li>
                        <li>• <code>boolean</code> - True/false</li>
                        <li>• <code>date</code> - Date/timestamp</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <h4 className="font-medium mb-2">Complex Types</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>array</code> - Array of values</li>
                        <li>• <code>object</code> - JSON object</li>
                        <li>• <code>json</code> - Raw JSON data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Demo Application Schemas</h3>
                  <div className="space-y-3">
                    <Badge variant="outline">schemas/user.json</Badge>
                    <Badge variant="outline">schemas/product.json</Badge>
                    <Badge variant="outline">schemas/order.json</Badge>
                    <Badge variant="outline">schemas/metric.json</Badge>
                    <Badge variant="outline">schemas/schema.json</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All schema files are located in the <code>schemas/</code> directory and automatically loaded by AutoCRUD Core.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Generated API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">REST API Endpoints</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    AutoCRUD Core automatically generates the following REST endpoints for each schema:
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg space-y-2 code-font text-sm">
                    <div><Badge className="mr-2">GET</Badge><code>/api/{`{schema}`}</code> - List all records</div>
                    <div><Badge className="mr-2">GET</Badge><code>/api/{`{schema}`}/{`{id}`}</code> - Get specific record</div>
                    <div><Badge variant="secondary" className="mr-2">POST</Badge><code>/api/{`{schema}`}</code> - Create new record</div>
                    <div><Badge variant="outline" className="mr-2">PATCH</Badge><code>/api/{`{schema}`}/{`{id}`}</code> - Update record</div>
                    <div><Badge variant="destructive" className="mr-2">DELETE</Badge><code>/api/{`{schema}`}/{`{id}`}</code> - Delete record</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">GraphQL API</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access the GraphQL playground at <code>/graphql</code> with auto-generated:
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div>• <strong>Queries:</strong> get{`{Schema}`}, list{`{Schema}`}s</div>
                    <div>• <strong>Mutations:</strong> create{`{Schema}`}, update{`{Schema}`}, delete{`{Schema}`}</div>
                    <div>• <strong>Types:</strong> Auto-generated from schema definitions</div>
                    <div>• <strong>Inputs:</strong> Create and update input types</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Join Endpoints</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Custom join endpoints based on configuration:
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg space-y-2 code-font text-sm">
                    <div><Badge className="mr-2">GET</Badge><code>/api/join/userOrders?userId={`{id}`}</code></div>
                    <div><Badge className="mr-2">GET</Badge><code>/api/join/orderDetails?orderId={`{id}`}</code></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Meta Endpoints</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2 code-font text-sm">
                    <div><Badge className="mr-2">GET</Badge><code>/api/autocrud/info</code> - Library information</div>
                    <div><Badge className="mr-2">GET</Badge><code>/api/metric</code> - Performance metrics</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Demo Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    className="w-full" 
                    onClick={() => window.open('/dashboard', '_blank')}
                  >
                    <i className="fas fa-globe mr-2"></i>
                    Interactive Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('/graphql', '_blank')}
                  >
                    <i className="fas fa-code mr-2"></i>
                    GraphQL Playground
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={() => window.open('https://www.npmjs.com/package/autocrud-core', '_blank')}>
              <i className="fab fa-npm mr-2"></i>
              View on NPM
            </Button>
            <Button variant="outline" onClick={() => window.open('https://github.com/vaibhavr2107/autocrud', '_blank')}>
              <i className="fab fa-github mr-2"></i>
              GitHub Repository
            </Button>
            <Button variant="outline" onClick={() => window.open('/dashboard', '_blank')}>
              <i className="fas fa-play mr-2"></i>
              Try Live Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
