import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/#features", label: "Features", external: true },
    { href: "/dashboard", label: "Live Demo" },
    { href: "/docs", label: "Documentation" },
    { href: "/#quickstart", label: "Quick Start", external: true },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center" data-testid="link-home">
              <i className="fas fa-database text-primary text-2xl mr-3"></i>
              <span className="text-xl font-bold text-foreground">AutoCRUD Core</span>
              <Badge variant="secondary" className="ml-2">v0.1.1</Badge>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${
                    location === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.label}
                </Link>
              )
            ))}
            
            <a
              href="https://github.com/vaibhavr2107/autocrud"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="nav-github"
            >
              <i className="fab fa-github text-lg"></i>
            </a>
            
            <a
              href="https://www.npmjs.com/package/autocrud-core"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="nav-install"
            >
              Install Now
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
              <i className="fas fa-bars"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
