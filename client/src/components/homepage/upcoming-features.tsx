import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UpcomingFeatures() {
  const upcomingFeatures = [
    {
      title: "Advanced Query Builder",
      description: "Visual query builder with complex joins, aggregations, and real-time preview",
      status: "In Development",
      icon: "fas fa-puzzle-piece",
      color: "bg-blue-500/10 text-blue-500",
      eta: "Q1 2025"
    },
    {
      title: "Real-time Subscriptions",
      description: "WebSocket and Server-Sent Events support for live data updates",
      status: "Planned",
      icon: "fas fa-broadcast-tower",
      color: "bg-purple-500/10 text-purple-500",
      eta: "Q2 2025"
    },
    {
      title: "API Versioning",
      description: "Built-in API versioning with backward compatibility and migration tools",
      status: "Research",
      icon: "fas fa-code-branch",
      color: "bg-green-500/10 text-green-500",
      eta: "Q2 2025"
    },
    {
      title: "Enhanced Security",
      description: "Advanced authentication, authorization, and rate limiting features",
      status: "Planned",
      icon: "fas fa-shield-alt",
      color: "bg-red-500/10 text-red-500",
      eta: "Q3 2025"
    },
    {
      title: "Cloud Integration",
      description: "Native support for AWS, Azure, and GCP deployment and services",
      status: "Research",
      icon: "fas fa-cloud",
      color: "bg-sky-500/10 text-sky-500",
      eta: "Q4 2025"
    },
    {
      title: "Plugin Ecosystem",
      description: "Extensible plugin system for custom functionality and third-party integrations",
      status: "Planned",
      icon: "fas fa-plug",
      color: "bg-orange-500/10 text-orange-500",
      eta: "Q4 2025"
    }
  ];

  return (
    <section id="upcoming-features" className="py-20 bg-gradient-to-br from-secondary/10 to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <i className="fas fa-rocket mr-2"></i>
            Coming Soon
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Upcoming Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Exciting new features and enhancements planned for AutoCRUD Core to make your development experience even better
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingFeatures.map((feature) => (
            <Card key={feature.title} className="card-hover border-2 border-transparent hover:border-primary/20" data-testid={`upcoming-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`${feature.color} p-3 rounded-lg`}>
                    <i className={`${feature.icon} text-xl`}></i>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={feature.status === "In Development" ? "default" : feature.status === "Planned" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {feature.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">{feature.eta}</div>
                  </div>
                </div>
                <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">
            Want to contribute or have suggestions?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/vaibhavr2107/autocrud/issues" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-contribute"
            >
              <i className="fab fa-github mr-2"></i>
              Contribute on GitHub
            </a>
            <a 
              href="https://github.com/vaibhavr2107/autocrud/discussions" 
              className="inline-flex items-center px-6 py-3 border border-border text-foreground rounded-lg hover:bg-card transition-colors"
              data-testid="button-discussions"
            >
              <i className="fas fa-comments mr-2"></i>
              Join Discussions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}