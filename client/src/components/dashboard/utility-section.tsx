import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UtilityEndpoint {
  path: string;
  description: string;
  method: string;
  format: 'json' | 'text' | 'openapi';
}

export default function UtilitySection() {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const utilityEndpoints: UtilityEndpoint[] = [
    {
      path: '/autocurd-health',
      description: 'Check autocrud service health status',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/autocurd-info',
      description: 'Get autocrud version and configuration summary',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/autocurd-list',
      description: 'List all available REST and GraphQL endpoints',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/autocurd-openapi.json',
      description: 'Get OpenAPI 3.0 specification for REST endpoints',
      method: 'GET',
      format: 'openapi'
    },
    {
      path: '/autocurd-sdl',
      description: 'Get GraphQL Schema Definition Language',
      method: 'GET',
      format: 'text'
    }
  ];

  const apiEndpoints: UtilityEndpoint[] = [
    {
      path: '/api/user',
      description: 'Get all users in the system',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/product',
      description: 'Get all products in the system',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/order',
      description: 'Get all orders in the system',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/schema',
      description: 'Get all schema definitions',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/metric',
      description: 'Get system metrics and performance data',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/graphql',
      description: 'GraphQL endpoint for complex queries',
      method: 'POST',
      format: 'json'
    }
  ];

  const executeUtilityCall = async (endpoint: UtilityEndpoint) => {
    const key = endpoint.path;
    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: {
          'Accept': endpoint.format === 'json' ? 'application/json' : 
                   endpoint.format === 'text' ? 'text/plain' : 
                   'application/json'
        }
      });

      let data;
      if (endpoint.format === 'text') {
        data = await response.text();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text; // fallback to text if not valid JSON
        }
      }

      setResponses(prev => ({ ...prev, [key]: data }));

      if (response.ok) {
        toast({
          title: "Request successful",
          description: `${endpoint.method} ${endpoint.path} completed`,
        });
      } else {
        toast({
          title: "Request failed",
          description: `${response.status}: ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorData = {
        error: "Network error",
        message: error instanceof Error ? error.message : "Failed to fetch",
        endpoint: endpoint.path
      };
      setResponses(prev => ({ ...prev, [key]: errorData }));
      
      toast({
        title: "Request failed",
        description: "Network error - endpoint may not be available",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const copyResponse = (data: any) => {
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Response data copied to clipboard",
    });
  };

  const generateCurlCommand = (endpoint: UtilityEndpoint) => {
    return `curl -X ${endpoint.method} "${window.location.origin}${endpoint.path}" \\
  -H "Accept: ${endpoint.format === 'json' ? 'application/json' : 
                endpoint.format === 'text' ? 'text/plain' : 
                'application/json'}"`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">AutoCRUD Utility Endpoints</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Explore AutoCRUD's built-in utility endpoints for health monitoring, API documentation, and service information.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4">
          <h4 className="text-md font-semibold text-foreground">AutoCRUD Utility Endpoints</h4>
          {utilityEndpoints.map((endpoint, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="font-mono">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeUtilityCall(endpoint)}
                      disabled={loading[endpoint.path]}
                      data-testid={`execute-${endpoint.path.replace('/', '')}`}
                    >
                      {loading[endpoint.path] ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-play mr-2"></i>
                      )}
                      Execute
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyResponse(generateCurlCommand(endpoint))}
                      data-testid={`copy-curl-${endpoint.path.replace('/', '')}`}
                    >
                      <i className="fas fa-copy mr-2"></i>
                      Copy cURL
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {endpoint.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>
                    <i className="fas fa-file-code mr-1"></i>
                    Format: {endpoint.format}
                  </span>
                </div>
                
                {/* Response Section */}
                {responses[endpoint.path] && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-foreground">Response</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyResponse(responses[endpoint.path])}
                        data-testid={`copy-response-${endpoint.path}`}
                      >
                        <i className="fas fa-copy text-xs"></i>
                      </Button>
                    </div>
                    {endpoint.path === '/autocurd-openapi.json' ? (
                      <div className="space-y-2">
                        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800 dark:text-green-200">OpenAPI 3.0 Specification</p>
                              <p className="text-xs text-green-600 dark:text-green-400">Interactive API documentation generated</p>
                            </div>
                            <i className="fas fa-file-alt text-green-600 dark:text-green-400"></i>
                          </div>
                          {responses[endpoint.path] && typeof responses[endpoint.path] === 'object' && (
                            <div className="mt-2">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-green-700 dark:text-green-300">Title:</span> 
                                  <span className="ml-1 font-medium">{responses[endpoint.path].info?.title || 'AutoCRUD API'}</span>
                                </div>
                                <div>
                                  <span className="text-green-700 dark:text-green-300">Version:</span> 
                                  <span className="ml-1 font-medium">{responses[endpoint.path].info?.version || '1.0.0'}</span>
                                </div>
                                <div>
                                  <span className="text-green-700 dark:text-green-300">Paths:</span> 
                                  <span className="ml-1 font-medium">{Object.keys(responses[endpoint.path].paths || {}).length}</span>
                                </div>
                                <div>
                                  <span className="text-green-700 dark:text-green-300">Schemas:</span> 
                                  <span className="ml-1 font-medium">{Object.keys(responses[endpoint.path].components?.schemas || {}).length}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800">
                            View Full OpenAPI JSON
                          </summary>
                          <div className="bg-muted p-3 rounded-lg max-h-48 overflow-auto mt-2">
                            <pre className="text-xs whitespace-pre-wrap">
                              {typeof responses[endpoint.path] === 'string' ? responses[endpoint.path] : JSON.stringify(responses[endpoint.path], null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    ) : endpoint.path === '/autocurd-sdl' ? (
                      <div className="space-y-2">
                        <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">GraphQL Schema Definition</p>
                              <p className="text-xs text-purple-600 dark:text-purple-400">SDL (Schema Definition Language)</p>
                            </div>
                            <i className="fas fa-code text-purple-600 dark:text-purple-400"></i>
                          </div>
                        </div>
                        <div className="bg-muted p-3 rounded-lg max-h-48 overflow-auto">
                          <pre className="text-xs whitespace-pre-wrap font-mono">
                            {typeof responses[endpoint.path] === 'string' ? responses[endpoint.path] : JSON.stringify(responses[endpoint.path], null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted p-3 rounded-lg max-h-48 overflow-auto">
                        {typeof responses[endpoint.path] === 'object' ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                              {Object.entries(responses[endpoint.path] as any).slice(0, 4).map(([key, value]) => (
                                <div key={key} className="bg-background p-2 rounded border">
                                  <span className="font-medium text-muted-foreground">{key}:</span>
                                  <div className="text-foreground mt-1">
                                    {typeof value === 'object' ? JSON.stringify(value).slice(0, 50) + '...' : String(value).slice(0, 50)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-800">
                                View Full JSON Response
                              </summary>
                              <pre className="text-xs whitespace-pre-wrap mt-2 p-2 bg-background rounded border">
                                {JSON.stringify(responses[endpoint.path], null, 2)}
                              </pre>
                            </details>
                          </div>
                        ) : (
                          <pre className="text-xs whitespace-pre-wrap">
                            {responses[endpoint.path]}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}