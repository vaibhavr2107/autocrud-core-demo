import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard: ' + text);
    });
  };

  return (
    <section className="hero-gradient pt-20 pb-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6" style={{ fontSize: '2rem', maxWidth: '100%' }}>
            Auto-Generate 
            <span className="gradient-text"> CRUD APIs</span>
            <br />from JSON Schemas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plug-and-play Node.js library that instantly creates REST + GraphQL endpoints from simple JSON schemas. 
            Ships with database adapters, caching, joins, and hot-reload.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <div className="bg-card px-4 py-2 rounded-lg border border-border code-font text-sm">
              <span className="text-muted-foreground">$</span> 
              <span className="text-accent">npm install</span> 
              <span className="text-foreground"> autocrud-core</span>
              <button 
                className="ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard('npm install autocrud-core')}
                data-testid="button-copy-install"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-try-demo">
                  Try Live Demo
                </Button>
              </Link>
              <a href="#quickstart">
                <Button variant="outline" data-testid="button-quick-start">
                  Quick Start
                </Button>
              </a>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="stat-downloads">130+</div>
              <div className="text-sm text-muted-foreground">Weekly Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent" data-testid="stat-formats">3</div>
              <div className="text-sm text-muted-foreground">API Formats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="stat-adapters">4</div>
              <div className="text-sm text-muted-foreground">Database Adapters</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-accent/10 rounded-lg rotate-12"></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-primary/10 rounded-lg"></div>
      </div>
    </section>
  );
}
