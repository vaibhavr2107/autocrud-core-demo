import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metric } from "@shared/schema";

interface MetricsSummary {
  averageResponseTime: number;
  cacheHitRate: number;
  requestsPerSecond: number;
}

export default function PerformanceMetrics() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch metrics summary
  const { data: summary, isLoading: summaryLoading } = useQuery<MetricsSummary>({
    queryKey: ['/api/metrics/summary'],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch detailed metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const [activeTab, setActiveTab] = useState("overview");

  // Calculate endpoint stats
  const endpointStats = metrics?.reduce((acc, metric) => {
    const key = `${metric.method} ${metric.endpoint}`;
    if (!acc[key]) {
      acc[key] = {
        method: metric.method,
        endpoint: metric.endpoint,
        count: 0,
        totalTime: 0,
        cacheHits: 0,
      };
    }
    acc[key].count++;
    acc[key].totalTime += metric.responseTime;
    if (metric.cacheHit) acc[key].cacheHits++;
    return acc;
  }, {} as Record<string, {
    method: string;
    endpoint: string;
    count: number;
    totalTime: number;
    cacheHits: number;
  }>);

  const sortedEndpoints = Object.values(endpointStats || {})
    .map(stat => ({
      ...stat,
      avgResponseTime: Math.round(stat.totalTime / stat.count),
      cacheHitRate: Math.round((stat.cacheHits / stat.count) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent activity (last 20 requests)
  const recentActivity = metrics?.slice(-20).reverse() || [];

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "default";
      case "POST": return "secondary";
      case "PATCH": return "outline";
      case "DELETE": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with auto-refresh toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
        <div className="flex items-center space-x-4">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="button-auto-refresh"
          >
            <i className={`fas fa-${autoRefresh ? 'pause' : 'play'} mr-2`}></i>
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Response Time</h4>
              <i className="fas fa-tachometer-alt text-primary text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="metric-response-time">
              {summaryLoading ? "..." : `${summary?.averageResponseTime || 0}ms`}
            </div>
            <div className="text-sm text-muted-foreground">Average API response</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Cache Hit Rate</h4>
              <i className="fas fa-memory text-accent text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-accent mb-2" data-testid="metric-cache-hit-rate">
              {summaryLoading ? "..." : `${summary?.cacheHitRate || 0}%`}
            </div>
            <div className="text-sm text-muted-foreground">Cache efficiency</div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">Requests/sec</h4>
              <i className="fas fa-chart-line text-orange-400 text-xl"></i>
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2" data-testid="metric-requests-per-sec">
              {summaryLoading ? "..." : `${summary?.requestsPerSecond || 0}`}
            </div>
            <div className="text-sm text-muted-foreground">Current throughput</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints" data-testid="tab-endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="activity" data-testid="tab-activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Request Distribution</h4>
                  <div className="space-y-2">
                    {["GET", "POST", "PATCH", "DELETE"].map(method => {
                      const count = metrics?.filter(m => m.method === method).length || 0;
                      const total = metrics?.length || 1;
                      const percentage = Math.round((count / total) * 100);
                      
                      return (
                        <div key={method} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant={getMethodColor(method) as any} className="min-w-16 justify-center">
                              {method}
                            </Badge>
                            <span className="text-sm text-foreground">{count} requests</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Performance Indicators</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Total Requests</span>
                      <span className="font-semibold" data-testid="total-requests">{metrics?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Cache Hits</span>
                      <span className="font-semibold text-accent" data-testid="cache-hits">
                        {metrics?.filter(m => m.cacheHit).length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Fastest Response</span>
                      <span className="font-semibold text-primary" data-testid="fastest-response">
                        {metrics?.length ? `${Math.min(...metrics.map(m => m.responseTime))}ms` : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Slowest Response</span>
                      <span className="font-semibold text-orange-400" data-testid="slowest-response">
                        {metrics?.length ? `${Math.max(...metrics.map(m => m.responseTime))}ms` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="endpoints" className="space-y-4">
              <h4 className="font-semibold text-foreground">Top Endpoints by Request Count</h4>
              {metricsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading endpoint statistics...</div>
              ) : (
                <div className="space-y-3">
                  {sortedEndpoints.map((endpoint, index) => (
                    <div key={`${endpoint.method}-${endpoint.endpoint}`} 
                         className="bg-muted p-4 rounded-lg"
                         data-testid={`endpoint-stat-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getMethodColor(endpoint.method) as any} className="min-w-16 justify-center">
                            {endpoint.method}
                          </Badge>
                          <span className="code-font text-sm">{endpoint.endpoint}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{endpoint.count} requests</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Response:</span>
                          <span className="font-medium">{endpoint.avgResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cache Hit Rate:</span>
                          <span className="font-medium">{endpoint.cacheHitRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <h4 className="font-semibold text-foreground">Recent API Requests</h4>
              {metricsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading recent activity...</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentActivity.map((metric, index) => (
                    <div key={metric.id} 
                         className="flex items-center justify-between p-3 bg-muted rounded-lg"
                         data-testid={`activity-${index}`}>
                      <div className="flex items-center space-x-3">
                        <Badge variant={getMethodColor(metric.method) as any} className="min-w-16 justify-center">
                          {metric.method}
                        </Badge>
                        <span className="code-font text-sm">{metric.endpoint}</span>
                        {metric.cacheHit && (
                          <Badge variant="outline" className="text-xs">
                            <i className="fas fa-memory mr-1"></i>
                            Cached
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">
                          {formatTime(metric.responseTime)}
                        </span>
                        <span className="text-muted-foreground">
                          {metric.timestamp ? new Date(metric.timestamp).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No recent activity to display
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Real-time Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-chart-area text-4xl text-primary mb-4"></i>
              <p className="text-muted-foreground mb-2">Live performance metrics visualization</p>
              <p className="text-sm text-muted-foreground">
                Chart showing response times, cache hits, and throughput over time
              </p>
              <Button variant="outline" className="mt-4" data-testid="button-refresh-metrics">
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
