import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Schema } from "@shared/schema";

export default function SchemaBuilder() {
  const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [schemaJson, setSchemaJson] = useState("");
  const { toast } = useToast();

  // Configuration schemas (read-only)
  const configSchemas = [
    { name: "user", type: "configuration", description: "User entity schema" },
    { name: "product", type: "configuration", description: "Product entity schema" },
    { name: "order", type: "configuration", description: "Order entity schema" },
    { name: "schema", type: "configuration", description: "Schema entity schema" },
    { name: "metric", type: "configuration", description: "Metric entity schema" }
  ];

  // Fetch user-created schemas
  const { data: userSchemas, isLoading } = useQuery<Schema[]>({
    queryKey: ['/api/schema'],
  });

  // Add default test schema on component mount
  React.useEffect(() => {
    if (userSchemas && userSchemas.length === 0 && !isCreating && !selectedSchema) {
      const testSchema = {
        name: "test",
        primaryKey: {
          name: "id",
          auto: true,
          strategy: "uuid",
          type: "string"
        },
        timestamps: true,
        fields: {
          id: {
            type: "string",
            required: true
          },
          name: {
            type: "string",
            required: true
          },
          email: {
            type: "string",
            required: false
          },
          status: {
            type: "string",
            default: "active"
          }
        }
      };
      setSelectedSchema({
        id: "test-schema",
        name: "test",
        definition: testSchema,
        isActive: true
      });
      setSchemaJson(JSON.stringify(testSchema, null, 2));
    }
  }, [userSchemas, isCreating, selectedSchema]);

  // Create schema mutation
  const createSchemaMutation = useMutation({
    mutationFn: async (data: { name: string; definition: any; isActive: boolean }) => {
      const response = await apiRequest('POST', '/api/schema', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schema'] });
      setIsCreating(false);
      setSchemaJson("");
      toast({
        title: "Schema created successfully",
        description: "Your new schema has been added to the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating schema",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update schema mutation
  const updateSchemaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/schema/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schema'] });
      toast({
        title: "Schema updated successfully",
        description: "Your schema changes have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating schema",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateSchema = () => {
    try {
      const definition = JSON.parse(schemaJson);
      if (!definition.name) {
        throw new Error("Schema must have a name");
      }
      
      createSchemaMutation.mutate({
        name: definition.name,
        definition,
        isActive: true,
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your schema JSON syntax.",
        variant: "destructive",
      });
    }
  };

  const handleSelectSchema = (schema: Schema) => {
    setSelectedSchema(schema);
    setSchemaJson(JSON.stringify(schema.definition, null, 2));
    setIsCreating(false);
  };

  const handleSelectConfigSchema = (configSchema: any) => {
    // For config schemas, we'll display them as read-only
    setSelectedSchema({ 
      ...configSchema, 
      id: configSchema.name, 
      isReadOnly: true,
      definition: {
        name: configSchema.name,
        type: "configuration",
        description: configSchema.description,
        note: "This is a system configuration schema and cannot be edited."
      }
    });
    setIsCreating(false);
    setSchemaJson(JSON.stringify({
      name: configSchema.name,
      type: "configuration", 
      description: configSchema.description,
      note: "This is a system configuration schema and cannot be edited. View the actual schema file in the schemas/ directory."
    }, null, 2));
  };

  const handleUpdateSchema = () => {
    if (!selectedSchema) return;
    
    try {
      const definition = JSON.parse(schemaJson);
      updateSchemaMutation.mutate({
        id: selectedSchema.id,
        data: { definition },
      });
    } catch (error) {
      toast({
        title: "Invalid JSON", 
        description: "Please check your schema JSON syntax.",
        variant: "destructive",
      });
    }
  };

  const defaultSchema = {
    name: "example",
    primaryKey: {
      name: "id",
      auto: true,
      strategy: "uuid",
      type: "string"
    },
    timestamps: true,
    fields: {
      id: {
        type: "string",
        required: true
      },
      email: {
        type: "string",
        required: true
      },
      name: {
        type: "string"
      },
      role: {
        type: "string",
        default: "user"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading schemas...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Schema List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Existing Schemas</h3>
          <Button
            onClick={() => {
              setIsCreating(true);
              setSelectedSchema(null);
              setSchemaJson(JSON.stringify(defaultSchema, null, 2));
            }}
            data-testid="button-create-schema"
          >
            <i className="fas fa-plus mr-2"></i>
            Create New
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Configuration Schemas (Read-only) */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Configuration Schemas (Read-only)</h4>
            <div className="space-y-2">
              {configSchemas.map((schema) => (
                <Card
                  key={schema.name}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => handleSelectConfigSchema(schema)}
                  data-testid={`config-schema-${schema.name}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-foreground">{schema.name}</h5>
                        <p className="text-xs text-muted-foreground">{schema.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">System</Badge>
                        <i className="fas fa-lock text-muted-foreground text-xs"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* User-created Schemas (Editable) */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">User-created Schemas (Editable)</h4>
            <div className="space-y-2">
              {userSchemas && userSchemas.length > 0 ? (
                userSchemas.map((schema: any) => (
                  <Card
                    key={schema.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSchema?.id === schema.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleSelectSchema(schema)}
                    data-testid={`user-schema-${schema.name}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-foreground">{schema.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {Object.keys((schema.definition as any)?.fields || {}).length} fields
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={schema.isActive ? "default" : "secondary"} className="text-xs">
                            {schema.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <i className="fas fa-chevron-right text-muted-foreground"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <i className="fas fa-plus-circle text-2xl mb-2"></i>
                  <p>No user schemas yet. Create your first schema!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schema Editor */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {isCreating ? "Create New Schema" : selectedSchema ? `Edit ${selectedSchema.name}` : "Schema Editor"}
          </h3>
          {(selectedSchema || isCreating) && (
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSchema(null);
                  setIsCreating(false);
                  setSchemaJson("");
                }}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={isCreating ? handleCreateSchema : handleUpdateSchema}
                disabled={createSchemaMutation.isPending || updateSchemaMutation.isPending}
                data-testid="button-save-schema"
              >
                {isCreating ? "Create" : "Update"} Schema
              </Button>
            </div>
          )}
        </div>

        {(selectedSchema || isCreating) ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="schema-json">Schema Definition (JSON)</Label>
              <Textarea
                id="schema-json"
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                className="code-font min-h-96"
                placeholder="Enter your schema definition..."
                data-testid="textarea-schema-json"
              />
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Schema Validation</h4>
              <p className="text-sm text-muted-foreground">
                Ensure your schema includes: <code>name</code>, <code>fields</code>, and optional <code>primaryKey</code> and <code>timestamps</code>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Complete Schema JSON View</h4>
              <p className="text-sm text-muted-foreground mb-3">
                This shows the complete JSON structure of schemas including system configuration schemas.
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap code-font">
{JSON.stringify({
  systemSchemas: configSchemas,
  userSchemas: userSchemas || [],
  totalSchemas: (userSchemas?.length || 0) + configSchemas.length,
  exampleSchema: defaultSchema
}, null, 2)}
              </pre>
            </div>
            <div className="text-center pt-4">
              <Button
                onClick={() => {
                  setIsCreating(true);
                  setSchemaJson(JSON.stringify(defaultSchema, null, 2));
                }}
                data-testid="button-create-first-schema"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Schema
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
