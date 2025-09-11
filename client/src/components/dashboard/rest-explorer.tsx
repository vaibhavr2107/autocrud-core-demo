import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiRequest {
  method: HttpMethod;
  url: string;
  body?: string;
  queryParams: Record<string, string>;
}

interface ApiResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  duration: number;
}

export default function RestExplorer() {
  const [request, setRequest] = useState<ApiRequest>({
    method: "GET",
    url: "/api/users",
    queryParams: {},
  });
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch available endpoints info
  const { data: apiInfo } = useQuery({
    queryKey: ['/api/autocrud/info'],
  });

  const executeRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // Build URL with query params
      const url = new URL(request.url, window.location.origin);
      Object.entries(request.queryParams).forEach(([key, value]) => {
        if (value.trim()) {
          url.searchParams.append(key, value);
        }
      });

      const requestOptions: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (request.body && request.method !== "GET") {
        requestOptions.body = request.body;
      }

      const response = await fetch(url.pathname + url.search, requestOptions);
      const data = await response.json();
      const duration = Date.now() - startTime;

      setResponse({
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
        duration,
      });

      if (response.ok) {
        toast({
          title: "Request successful",
          description: `${request.method} ${request.url} (${duration}ms)`,
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setResponse({
        status: 0,
        data: { error: error instanceof Error ? error.message : "Unknown error" },
        headers: {},
        duration,
      });
      
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQueryParam = (key: string, value: string) => {
    setRequest(prev => ({
      ...prev,
      queryParams: { ...prev.queryParams, [key]: value }
    }));
  };

  const predefinedEndpoints = [
    { method: "GET", url: "/api/users", description: "List all users" },
    { method: "POST", url: "/api/users", description: "Create new user" },
    { method: "GET", url: "/api/users/user-1", description: "Get user by ID" },
    { method: "PATCH", url: "/api/users/user-1", description: "Update user" },
    { method: "GET", url: "/api/products", description: "List all products" },
    { method: "POST", url: "/api/products", description: "Create new product" },
    { method: "GET", url: "/api/orders", description: "List all orders" },
    { method: "GET", url: "/api/orders?withDetails=true", description: "List orders with details" },
    { method: "GET", url: "/api/metrics/summary", description: "Get performance metrics" },
  ];

  const exampleBodies = {
    "/api/users": JSON.stringify({
      email: "newuser@example.com",
      name: "New User",
      role: "user"
    }, null, 2),
    "/api/products": JSON.stringify({
      name: "New Product",
      description: "A sample product",
      price: 2999,
      category: "Electronics",
      inStock: true
    }, null, 2),
    "/api/orders": JSON.stringify({
      userId: "user-1", 
      productId: 101,
      quantity: 2,
      totalAmount: 5998,
      status: "pending"
    }, null, 2),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Request Builder */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">API Request Builder</h3>
          
          {/* Method and URL */}
          <div className="flex items-center space-x-2 mb-4">
            <Select
              value={request.method}
              onValueChange={(value: HttpMethod) => setRequest(prev => ({ ...prev, method: value }))}
            >
              <SelectTrigger className="w-32" data-testid="select-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              value={request.url}
              onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
              placeholder="/api/endpoint"
              className="flex-1 code-font"
              data-testid="input-url"
            />
          </div>

          {/* Quick endpoint selector */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Quick Select Endpoint</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {predefinedEndpoints.map((endpoint, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => setRequest(prev => ({
                    ...prev,
                    method: endpoint.method as HttpMethod,
                    url: endpoint.url.split('?')[0],
                    queryParams: endpoint.url.includes('?') ? 
                      Object.fromEntries(new URLSearchParams(endpoint.url.split('?')[1])) : {}
                  }))}
                  data-testid={`endpoint-${index}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Badge
                        variant={endpoint.method === "GET" ? "default" : 
                               endpoint.method === "POST" ? "secondary" :
                               endpoint.method === "PATCH" ? "outline" : "destructive"}
                        className="mr-2 min-w-16 justify-center"
                      >
                        {endpoint.method}
                      </Badge>
                      <span className="code-font text-sm">{endpoint.url}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{endpoint.description}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Query Parameters */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">Query Parameters</Label>
            <div className="space-y-2">
              {["limit", "offset", "withDetails"].map((param) => (
                <div key={param} className="grid grid-cols-2 gap-2">
                  <Input
                    value={param}
                    readOnly
                    className="text-sm"
                  />
                  <Input
                    value={request.queryParams[param] || ""}
                    onChange={(e) => updateQueryParam(param, e.target.value)}
                    placeholder="value"
                    className="text-sm"
                    data-testid={`param-${param}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Request Body */}
          {request.method !== "GET" && (
            <div className="mb-4">
              <Label htmlFor="request-body" className="text-sm font-medium mb-2 block">
                Request Body (JSON)
              </Label>
              <Textarea
                id="request-body"
                value={request.body || ""}
                onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter JSON request body..."
                className="code-font min-h-32"
                data-testid="textarea-request-body"
              />
              {exampleBodies[request.url as keyof typeof exampleBodies] && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setRequest(prev => ({
                    ...prev,
                    body: exampleBodies[request.url as keyof typeof exampleBodies]
                  }))}
                  data-testid="button-load-example"
                >
                  Load Example
                </Button>
              )}
            </div>
          )}

          <Button
            onClick={executeRequest}
            disabled={isLoading}
            className="w-full"
            data-testid="button-send-request"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-play mr-2"></i>
                Send Request
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Response Viewer */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Response</h3>
        
        {response ? (
          <div className="space-y-4">
            {/* Status and timing */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-4">
                <Badge
                  variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}
                  data-testid="response-status"
                >
                  {response.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {response.duration}ms
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))}
                data-testid="button-copy-response"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy
              </Button>
            </div>

            {/* Response body */}
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm code-font text-foreground whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>

            {/* Response headers */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Response Headers</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-muted-foreground w-32 flex-shrink-0">{key}:</span>
                    <span className="text-foreground code-font">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-exchange-alt text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground">Send a request to see the response here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
