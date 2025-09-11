import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeaturesSection() {
  const features = [
    {
      title: "Functions API",
      icon: "fas fa-code",
      color: "bg-primary/10 text-primary",
      description: "Direct function calls for server-side usage",
      code: `const user = await functions.user.insert({
  email: "user@example.com"
});`,
    },
    {
      title: "REST API", 
      icon: "fas fa-globe",
      color: "bg-accent/10 text-accent",
      description: "Standard HTTP endpoints with full CRUD operations",
      code: `POST /api/user
GET  /api/user/:id
PATCH /api/user/:id`,
    },
    {
      title: "GraphQL",
      icon: "fas fa-project-diagram", 
      color: "bg-pink-500/10 text-pink-500",
      description: "Auto-generated schema with typed queries and mutations",
      code: `mutation {
  createUser(input: {
    email: "user@example.com"
  }) { id email }
}`,
    },
  ];

  const adapters = [
    { name: "File", icon: "fas fa-file", color: "text-yellow-500", desc: "JSON files" },
    { name: "SQLite", icon: "fas fa-database", color: "text-blue-500", desc: "better-sqlite3" },
    { name: "PostgreSQL", icon: "fas fa-server", color: "text-green-500", desc: "Production ready" },
    { name: "MongoDB", icon: "fas fa-leaf", color: "text-green-600", desc: "NoSQL support" },
  ];

  return (
    <section id="features" className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Three Ways to Use Your Data</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Define schemas once, get Functions, REST APIs, and GraphQL endpoints automatically generated
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <Card key={feature.title} className="card-hover" data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className={`${feature.color} p-3 rounded-lg mr-4`}>
                    <i className={`${feature.icon} text-xl`}></i>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg code-font text-sm">
                  <pre className="text-foreground whitespace-pre-wrap">{feature.code}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Adapters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center mb-6">Multiple Database Adapters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {adapters.map((adapter) => (
                <div key={adapter.name} className="text-center" data-testid={`adapter-${adapter.name.toLowerCase()}`}>
                  <div className={`bg-${adapter.color.split('-')[1]}-500/10 p-4 rounded-lg mb-3 inline-block`}>
                    <i className={`${adapter.icon} ${adapter.color} text-2xl`}></i>
                  </div>
                  <div className="text-foreground font-medium">{adapter.name}</div>
                  <div className="text-sm text-muted-foreground">{adapter.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
