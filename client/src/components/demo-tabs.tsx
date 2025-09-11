import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DemoTab = "schema" | "rest" | "graphql" | "metrics";

export default function DemoTabs() {
  const [activeTab, setActiveTab] = useState<DemoTab>("schema");

  const tabs = [
    { id: "schema" as const, label: "Schema Builder" },
    { id: "rest" as const, label: "REST Explorer" },
    { id: "graphql" as const, label: "GraphQL Playground" },
    { id: "metrics" as const, label: "Performance Metrics" },
  ];

  return (
    <section id="demo" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Interactive Live Demo</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience AutoCRUD Core in action with real-time CRUD operations and API exploration
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-border">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`px-6 py-4 rounded-none border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`demo-tab-${tab.id}`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <CardContent className="p-8">
            {activeTab === "schema" && <SchemaBuilderDemo />}
            {activeTab === "rest" && <RestExplorerDemo />}
            {activeTab === "graphql" && <GraphQLDemo />}
            {activeTab === "metrics" && <MetricsDemo />}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SchemaBuilderDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">JSON Schema Definition</h4>
        <div className="bg-muted p-4 rounded-lg code-font text-sm h-80 overflow-y-auto">
          <pre className="text-foreground whitespace-pre-wrap">
{`{
  "name": "user",
  "primaryKey": {
    "name": "id",
    "auto": true,
    "strategy": "uuid",
    "type": "string"
  },
  "timestamps": true,
  "fields": {
    "id": {
      "type": "string",
      "required": true
    },
    "email": {
      "type": "string", 
      "required": true
    },
    "name": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "default": "user"
    }
  }
}`}
          </pre>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">Generated API Endpoints</h4>
        <div className="space-y-3">
          {[
            { method: "POST", path: "/api/user", desc: "Create user" },
            { method: "GET", path: "/api/user", desc: "List users" },
            { method: "GET", path: "/api/user/:id", desc: "Get user by ID" },
            { method: "PATCH", path: "/api/user/:id", desc: "Update user" },
            { method: "DELETE", path: "/api/user/:id", desc: "Delete user" },
          ].map((endpoint) => (
            <div key={`${endpoint.method}-${endpoint.path}`} className="api-endpoint p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge
                    variant={endpoint.method === "GET" ? "default" : 
                           endpoint.method === "POST" ? "secondary" :
                           endpoint.method === "PATCH" ? "outline" : "destructive"}
                    className="mr-3 min-w-16 justify-center"
                  >
                    {endpoint.method}
                  </Badge>
                  <span className="code-font text-sm text-foreground">{endpoint.path}</span>
                </div>
                <span className="text-xs text-muted-foreground">{endpoint.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h5 className="text-md font-semibold text-foreground mb-3">GraphQL Schema</h5>
          <div className="bg-muted p-3 rounded-lg code-font text-xs">
            <pre className="text-foreground whitespace-pre-wrap">
{`type User {
  id: ID!
  email: String!
  name: String
  role: String
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestExplorerDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">API Request</h4>
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center mb-4">
            <select className="bg-card border border-border rounded px-3 py-2 text-sm mr-3">
              <option>GET</option>
              <option>POST</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
            <input
              type="text"
              value="/api/user"
              className="flex-1 bg-card border border-border rounded px-3 py-2 text-sm code-font"
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Query Parameters</label>
            <div className="bg-card border border-border rounded p-3 code-font text-sm">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="limit" className="w-full bg-muted border border-border rounded px-2 py-1 text-xs" />
                <input type="text" placeholder="10" className="w-full bg-muted border border-border rounded px-2 py-1 text-xs" />
              </div>
            </div>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <i className="fas fa-play mr-2"></i>Send Request
          </Button>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">Response</h4>
        <div className="bg-muted p-4 rounded-lg code-font text-sm h-80 overflow-y-auto">
          <pre className="text-foreground whitespace-pre-wrap">
{`[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "jane@example.com", 
    "name": "Jane Smith",
    "role": "user",
    "createdAt": "2024-01-15T11:15:00Z",
    "updatedAt": "2024-01-15T11:15:00Z"
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function GraphQLDemo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">GraphQL Query</h4>
        <div className="bg-muted p-4 rounded-lg code-font text-sm h-80">
          <pre className="text-foreground whitespace-pre-wrap">
{`query GetUsers {
  userList(
    filter: {
      role: { eq: "admin" }
    }
    pagination: { limit: 10 }
  ) {
    id
    email
    name
    role
    createdAt
  }
}`}
          </pre>
        </div>
        <Button className="mt-4 bg-pink-500 text-white hover:bg-pink-600">
          <i className="fas fa-play mr-2"></i>Execute Query
        </Button>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-foreground mb-4">Response</h4>
        <div className="bg-muted p-4 rounded-lg code-font text-sm h-80 overflow-y-auto">
          <pre className="text-foreground whitespace-pre-wrap">
{`{
  "data": {
    "userList": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "john@example.com",
        "name": "John Doe", 
        "role": "admin",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function MetricsDemo() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Response Time</h4>
            <i className="fas fa-tachometer-alt text-primary"></i>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">12ms</div>
          <div className="text-sm text-muted-foreground">Average API response</div>
        </div>
        <div className="metric-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Cache Hit Rate</h4>
            <i className="fas fa-memory text-accent"></i>
          </div>
          <div className="text-3xl font-bold text-accent mb-2">94%</div>
          <div className="text-sm text-muted-foreground">Cache efficiency</div>
        </div>
        <div className="metric-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Requests/sec</h4>
            <i className="fas fa-chart-line text-orange-400"></i>
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">1,250</div>
          <div className="text-sm text-muted-foreground">Peak throughput</div>
        </div>
      </div>
      <div className="bg-muted/50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-foreground mb-4">Real-time Performance Chart</h4>
        <div className="h-64 bg-card rounded border border-border flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-chart-area text-4xl text-primary mb-4"></i>
            <p className="text-muted-foreground">Live performance metrics would be displayed here</p>
            <p className="text-sm text-muted-foreground mt-2">Monitoring response times, cache hits, and throughput</p>
          </div>
        </div>
      </div>
    </div>
  );
}
