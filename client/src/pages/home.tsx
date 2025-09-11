import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import DemoTabs from "@/components/demo-tabs";
import LiveDemoSection from "@/components/live-demo-section";
import QuickStart from "@/components/quick-start";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <LiveDemoSection />
      <QuickStart />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <i className="fas fa-database text-primary text-2xl mr-3"></i>
                <span className="text-xl font-bold text-foreground">AutoCRUD Core</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Auto-generate CRUD REST + GraphQL endpoints from JSON schemas. 
                Built for developers who value speed and simplicity.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/vaibhavr2107/autocrud" 
                   className="text-muted-foreground hover:text-foreground transition-colors"
                   data-testid="link-github">
                  <i className="fab fa-github text-xl"></i>
                </a>
                <a href="https://www.npmjs.com/package/autocrud-core" 
                   className="text-muted-foreground hover:text-foreground transition-colors"
                   data-testid="link-npm">
                  <i className="fab fa-npm text-xl"></i>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="/docs" className="hover:text-foreground transition-colors" data-testid="link-docs">Documentation</a></li>
                <li><a href="/dashboard" className="hover:text-foreground transition-colors" data-testid="link-demo">Live Demo</a></li>
                <li><a href="https://github.com/vaibhavr2107/autocrud/issues" className="hover:text-foreground transition-colors" data-testid="link-issues">Issues</a></li>
                <li><a href="#quickstart" className="hover:text-foreground transition-colors" data-testid="link-quickstart">Quick Start</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>REST APIs</li>
                <li>GraphQL</li>
                <li>Multiple Databases</li>
                <li>Real-time Updates</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 AutoCRUD Core. Licensed under Apache-2.0.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
