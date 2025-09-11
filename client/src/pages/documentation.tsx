import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Documentation() {
  const docSections = [
    {
      title: "Configuration",
      icon: "fas fa-cogs",
      color: "bg-blue-500/10 text-blue-500",
      description: "Complete configuration reference with all available options and database adapters.",
      topics: [
        "Server configuration",
        "Database adapters", 
        "Schema definitions",
        "Caching & performance"
      ]
    },
    {
      title: "API Reference", 
      icon: "fas fa-book",
      color: "bg-green-500/10 text-green-500",
      description: "Detailed documentation for REST endpoints, GraphQL schema, and function APIs.",
      topics: [
        "REST endpoints",
        "GraphQL queries & mutations",
        "Function API methods",
        "Request/response examples"
      ]
    },
    {
      title: "Advanced Features",
      icon: "fas fa-magic", 
      color: "bg-purple-500/10 text-purple-500",
      description: "Explore powerful features like joins, transforms, caching, and observability.",
      topics: [
        "Join relationships",
        "Data transforms",
        "Caching strategies", 
        "Metrics & monitoring"
      ]
    },
    {
      title: "Database Adapters",
      icon: "fas fa-database",
      color: "bg-orange-500/10 text-orange-500", 
      description: "Learn how to configure and use different database backends.",
      topics: [
        "File-based storage",
        "SQLite setup",
        "PostgreSQL configuration",
        "MongoDB integration"
      ]
    },
    {
      title: "Examples",
      icon: "fas fa-code",
      color: "bg-pink-500/10 text-pink-500",
      description: "Real-world examples and best practices for common use cases.",
      topics: [
        "User management system",
        "E-commerce product catalog", 
        "Blog with comments",
        "Multi-tenant applications"
      ]
    },
    {
      title: "Migration Guide",
      icon: "fas fa-route",
      color: "bg-yellow-500/10 text-yellow-500",
      description: "Step-by-step guides for migrating existing projects and upgrading versions.",
      topics: [
        "From Express.js",
        "From other CRUD libraries",
        "Version upgrades",
        "Data migration"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Comprehensive Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know to build powerful CRUD APIs with AutoCRUD Core
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {docSections.map((section) => (
            <Card key={section.title} className="card-hover cursor-pointer" data-testid={`doc-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader>
                <div className={`${section.color} p-3 rounded-lg w-fit mb-4`}>
                  <i className={`${section.icon} text-xl`}></i>
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{section.description}</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  {section.topics.map((topic) => (
                    <li key={topic}>• {topic}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Guide */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <i className="fas fa-download text-primary mr-3"></i>
              Installation Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">1. Install AutoCRUD Core</h3>
              <div className="bg-muted p-4 rounded-lg code-font text-sm">
                <div className="flex items-center justify-between">
                  <span>npm install autocrud-core</span>
                  <Badge variant="secondary">Required</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">2. Install Database Adapter (Optional)</h3>
              <div className="bg-muted p-4 rounded-lg code-font text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span>npm install better-sqlite3</span>
                  <Badge variant="outline">SQLite</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>npm install pg</span>
                  <Badge variant="outline">PostgreSQL</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>npm install mongodb</span>
                  <Badge variant="outline">MongoDB</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">3. Basic Configuration</h3>
              <div className="bg-muted p-4 rounded-lg code-font text-sm">
                <pre className="text-foreground whitespace-pre-wrap">
{`import { buildAutoCRUD } from 'autocrud-core';

const config = {
  server: { port: 4000 },
  database: { type: 'file', url: './data' },
  schemas: {
    user: { file: './schemas/user.json' }
  }
};

const app = await buildAutoCRUD(config);
await app.start();`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <i className="fas fa-book text-accent mr-3"></i>
              API Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">REST Endpoints</h3>
                <div className="space-y-3">
                  {[
                    { method: "GET", path: "/api/users", desc: "List all users" },
                    { method: "POST", path: "/api/users", desc: "Create new user" },
                    { method: "GET", path: "/api/users/:id", desc: "Get user by ID" },
                    { method: "PATCH", path: "/api/users/:id", desc: "Update user" },
                    { method: "DELETE", path: "/api/users/:id", desc: "Delete user" },
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
                          <span className="code-font text-sm">{endpoint.path}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{endpoint.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">GraphQL Operations</h3>
                <div className="bg-muted p-4 rounded-lg code-font text-sm">
                  <pre className="text-foreground whitespace-pre-wrap">
{`# Queries
user(id: ID!): User
userList(
  filter: UserFilter
  pagination: PaginationInput
  sort: UserSort
): [User!]!

# Mutations  
createUser(input: UserInput!): User
updateUser(id: ID!, input: UserInput!): User
deleteUser(id: ID!): Boolean`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <a 
            href="https://github.com/vaibhavr2107/autocrud#readme"
            className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-flex items-center"
            data-testid="button-full-docs"
          >
            <i className="fas fa-external-link-alt mr-2"></i>
            View Full Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
