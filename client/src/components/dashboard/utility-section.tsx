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
      path: '/api/autocrud/health',
      description: 'Check autocrud service health status',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/autocrud/info',
      description: 'Get autocrud version and configuration summary',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/autocrud/list',
      description: 'List all available REST and GraphQL endpoints',
      method: 'GET',
      format: 'json'
    },
    {
      path: '/api/autocrud/openapi.json',
      description: 'Get OpenAPI 3.0 specification for REST endpoints',
      method: 'GET',
      format: 'openapi'
    },
    {
      path: '/api/autocrud/sdl',
      description: 'Get GraphQL Schema Definition Language',
      method: 'GET',
      format: 'text'
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

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="endpoints" data-testid="tab-endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="responses" data-testid="tab-responses">Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4">
            {utilityEndpoints.map((endpoint, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="font-mono">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <Button
                      onClick={() => executeUtilityCall(endpoint)}
                      disabled={loading[endpoint.path]}
                      size="sm"
                      data-testid={`execute-${index}`}
                    >
                      {loading[endpoint.path] ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play mr-2"></i>
                          Execute
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {endpoint.description}
                  </p>
                  
                  <div className="mt-3">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                        Show cURL command
                      </summary>
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <code className="text-xs whitespace-pre-wrap">
                          {generateCurlCommand(endpoint)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => copyResponse(generateCurlCommand(endpoint))}
                          data-testid={`copy-curl-${index}`}
                        >
                          <i className="fas fa-copy text-xs"></i>
                        </Button>
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          {Object.keys(responses).length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-rocket text-4xl text-blue-500 mb-4"></i>
              <p className="text-muted-foreground">
                Execute some endpoints to see responses here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(responses).map(([path, data]) => (
                <Card key={path}>
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-base font-mono">{path}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyResponse(data)}
                      data-testid={`copy-response-${path}`}
                    >
                      <i className="fas fa-copy mr-2"></i>
                      Copy
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg max-h-64 overflow-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}