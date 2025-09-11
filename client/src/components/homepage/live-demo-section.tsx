import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LiveDemoSection() {
  return (
    <section id="live-demo" className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <i className="fas fa-rocket mr-2"></i>
            Live & Interactive
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Try GraphQL & REST APIs Now
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience real-time CRUD operations with our fully functional GraphQL playground and REST API explorer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GraphQL Live Demo */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <i className="fas fa-project-diagram text-pink-500 text-2xl mr-3"></i>
                  <h3 className="text-xl font-semibold text-foreground">GraphQL Playground</h3>
                </div>
                <Badge variant="default" className="bg-pink-500">Live</Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-muted p-4 rounded-lg code-font text-sm">
                  <pre className="text-foreground whitespace-pre-wrap">
{`query GetUsers {
  userList(pagination: { limit: 5 }) {
    nodes {
      id
      email
      name
      role
    }
    totalCount
  }
}`}
                  </pre>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <i className="fas fa-filter mr-1"></i>Advanced Filtering
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <i className="fas fa-sort mr-1"></i>Pagination
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <i className="fas fa-link mr-1"></i>Relationships
                  </Badge>
                </div>
              </div>

              <Button 
                className="w-full bg-pink-500 text-white hover:bg-pink-600" 
                onClick={() => window.open('/dashboard', '_blank')}
                data-testid="button-try-graphql-demo"
              >
                <i className="fas fa-play mr-2"></i>
                Try GraphQL Live Demo
              </Button>
            </CardContent>
          </Card>

          {/* REST API Live Demo */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <i className="fas fa-globe text-primary text-2xl mr-3"></i>
                  <h3 className="text-xl font-semibold text-foreground">REST API Explorer</h3>
                </div>
                <Badge variant="default">Live</Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center">
                      <Badge variant="default" className="mr-2 min-w-16 justify-center bg-green-600">GET</Badge>
                      <span className="code-font text-sm">/api/users</span>
                    </div>
                    <span className="text-xs text-muted-foreground">List users</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2 min-w-16 justify-center bg-blue-600">POST</Badge>
                      <span className="code-font text-sm">/api/users</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Create user</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 min-w-16 justify-center">PATCH</Badge>
                      <span className="code-font text-sm">/api/users/:id</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Update user</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                onClick={() => window.open('/dashboard', '_blank')}
                data-testid="button-try-rest-demo"
              >
                <i className="fas fa-globe mr-2"></i>
                Try REST API Live Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to integrate AutoCRUD into your project?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <i className="fab fa-npm mr-2"></i>
              Install from NPM
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.open('/docs', '_blank')}>
              <i className="fas fa-book mr-2"></i>
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}