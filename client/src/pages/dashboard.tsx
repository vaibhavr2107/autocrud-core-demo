import { useState } from "react";
import Navigation from "@/components/navigation";
import SchemaBuilder from "@/components/schema-builder";
import RestExplorer from "@/components/rest-explorer";
import GraphQLPlayground from "@/components/graphql-playground";
import PerformanceMetrics from "@/components/performance-metrics";
import { Button } from "@/components/ui/button";

type DashboardTab = "schema" | "rest" | "graphql" | "metrics";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("schema");

  const tabs = [
    { id: "schema" as const, label: "Schema Builder", icon: "fas fa-code" },
    { id: "rest" as const, label: "REST Explorer", icon: "fas fa-globe" },
    { id: "graphql" as const, label: "GraphQL Playground", icon: "fas fa-project-diagram" },
    { id: "metrics" as const, label: "Performance Metrics", icon: "fas fa-chart-line" },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Interactive Live Demo</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Experience AutoCRUD Core in action with real-time CRUD operations and API exploration
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                  data-testid={`tab-${tab.id}`}
                >
                  <i className={`${tab.icon} mr-2`}></i>
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "schema" && <SchemaBuilder />}
            {activeTab === "rest" && <RestExplorer />}
            {activeTab === "graphql" && <GraphQLPlayground />}
            {activeTab === "metrics" && <PerformanceMetrics />}
          </div>
        </div>
      </div>
    </div>
  );
}
