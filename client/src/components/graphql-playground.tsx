import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export default function GraphQLPlayground() {
  const [query, setQuery] = useState(`query GetUsers {
  userList(
    filter: {
      role: { eq: "admin" }
    }
    pagination: { limit: 10 }
  ) {
    id
    email
    name
    role
    createdAt
  }
}`);
  
  const [mutation, setMutation] = useState(`mutation CreateUser($input: UserInput!) {
  createUser(input: $input) {
    id
    email
    name
    role
    createdAt
  }
}`);

  const [variables, setVariables] = useState(`{
  "input": {
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user"
  }
}`);

  const [response, setResponse] = useState<GraphQLResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("query");
  const { toast } = useToast();

  const executeGraphQL = async (operation: string, vars?: string) => {
    setIsLoading(true);
    
    try {
      const body = {
        query: operation,
        variables: vars ? JSON.parse(vars) : undefined,
      };

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      setResponse(result);

      if (result.errors) {
        toast({
          title: "GraphQL Error",
          description: result.errors[0]?.message || "Unknown GraphQL error",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Query executed successfully",
          description: "GraphQL operation completed",
        });
      }
    } catch (error) {
      const errorResult = {
        errors: [{
          message: error instanceof Error ? error.message : "Network error - GraphQL endpoint not available in demo",
        }]
      };
      setResponse(errorResult);
      
      toast({
        title: "Execution failed",
        description: "GraphQL endpoint not available in this demo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = () => {
    const currentOperation = activeTab === "query" ? query : mutation;
    const currentVariables = activeTab === "mutation" ? variables : undefined;
    executeGraphQL(currentOperation, currentVariables);
  };

  const predefinedQueries = [
    {
      name: "List Users",
      query: `query GetUsers {
  userList(pagination: { limit: 10 }) {
    id
    email
    name
    role
    createdAt
  }
}`,
    },
    {
      name: "Get User by ID",
      query: `query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    name
    role
    createdAt
  }
}`,
      variables: `{
  "id": "user-1"
}`,
    },
    {
      name: "Filter Users by Role",
      query: `query FilterUsers($role: String!) {
  userList(
    filter: { role: { eq: $role } }
    pagination: { limit: 5 }
  ) {
    id
    email
    name
    role
  }
}`,
      variables: `{
  "role": "admin"
}`,
    },
  ];

  const predefinedMutations = [
    {
      name: "Create User",
      mutation: `mutation CreateUser($input: UserInput!) {
  createUser(input: $input) {
    id
    email
    name
    role
    createdAt
  }
}`,
      variables: `{
  "input": {
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user"
  }
}`,
    },
    {
      name: "Update User",
      mutation: `mutation UpdateUser($id: ID!, $input: UserInput!) {
  updateUser(id: $id, input: $input) {
    id
    email
    name
    role
    updatedAt
  }
}`,
      variables: `{
  "id": "user-1",
  "input": {
    "name": "Updated Name"
  }
}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* GraphQL Editor */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">GraphQL Playground</h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="query" data-testid="tab-query">Queries</TabsTrigger>
              <TabsTrigger value="mutation" data-testid="tab-mutation">Mutations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="query" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Predefined Queries</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {predefinedQueries.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => {
                        setQuery(example.query);
                        if (example.variables) {
                          setVariables(example.variables);
                        }
                      }}
                      data-testid={`query-example-${index}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{example.name}</span>
                        <i className="fas fa-code text-primary"></i>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="query-editor" className="text-sm font-medium mb-2 block">
                  GraphQL Query
                </label>
                <Textarea
                  id="query-editor"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="code-font min-h-64"
                  placeholder="Enter your GraphQL query..."
                  data-testid="textarea-query"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="mutation" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Predefined Mutations</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {predefinedMutations.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => {
                        setMutation(example.mutation);
                        setVariables(example.variables);
                      }}
                      data-testid={`mutation-example-${index}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{example.name}</span>
                        <i className="fas fa-edit text-accent"></i>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="mutation-editor" className="text-sm font-medium mb-2 block">
                  GraphQL Mutation
                </label>
                <Textarea
                  id="mutation-editor"
                  value={mutation}
                  onChange={(e) => setMutation(e.target.value)}
                  className="code-font min-h-48"
                  placeholder="Enter your GraphQL mutation..."
                  data-testid="textarea-mutation"
                />
              </div>
              
              <div>
                <label htmlFor="variables-editor" className="text-sm font-medium mb-2 block">
                  Variables (JSON)
                </label>
                <Textarea
                  id="variables-editor"
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  className="code-font min-h-32"
                  placeholder="Enter variables as JSON..."
                  data-testid="textarea-variables"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full bg-pink-500 text-white hover:bg-pink-600"
            data-testid="button-execute-graphql"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Executing...
              </>
            ) : (
              <>
                <i className="fas fa-play mr-2"></i>
                Execute {activeTab === "query" ? "Query" : "Mutation"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Response Viewer */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Response</h3>
          {response && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
              data-testid="button-copy-graphql-response"
            >
              <i className="fas fa-copy mr-2"></i>
              Copy
            </Button>
          )}
        </div>
        
        {response ? (
          <div className="space-y-4">
            {/* Status indicator */}
            <div className="flex items-center space-x-4">
              <Badge
                variant={response.errors ? "destructive" : "default"}
                data-testid="graphql-status"
              >
                {response.errors ? "Error" : "Success"}
              </Badge>
              {response.errors && (
                <span className="text-sm text-muted-foreground">
                  {response.errors.length} error(s)
                </span>
              )}
            </div>

            {/* Response data */}
            {response.data && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Data</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm code-font text-foreground whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Response errors */}
            {response.errors && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Errors</h4>
                <div className="space-y-2">
                  {response.errors.map((error, index) => (
                    <div key={index} className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                      <p className="text-destructive font-medium">{error.message}</p>
                      {error.locations && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Line {error.locations[0]?.line}, Column {error.locations[0]?.column}
                        </p>
                      )}
                      {error.path && (
                        <p className="text-sm text-muted-foreground">
                          Path: {error.path.join(' → ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-project-diagram text-4xl text-pink-500 mb-4"></i>
              <p className="text-muted-foreground mb-2">Execute a GraphQL operation to see results</p>
              <p className="text-sm text-muted-foreground">
                Note: GraphQL endpoint is simulated in this demo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
