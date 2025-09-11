import { useState } from "react";
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

  // Fetch schemas
  const { data: schemas, isLoading } = useQuery<Schema[]>({
    queryKey: ['/api/schemas'],
  });

  // Create schema mutation
  const createSchemaMutation = useMutation({
    mutationFn: async (data: { name: string; definition: any; isActive: boolean }) => {
      const response = await apiRequest('POST', '/api/schemas', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
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
      const response = await apiRequest('PATCH', `/api/schemas/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schemas'] });
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
        
        <div className="space-y-3">
          {schemas?.map((schema) => (
            <Card
              key={schema.id}
              className={`cursor-pointer transition-colors ${
                selectedSchema?.id === schema.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
              onClick={() => handleSelectSchema(schema)}
              data-testid={`schema-item-${schema.name}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{schema.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(schema.definition.fields || {}).length} fields
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={schema.isActive ? "default" : "secondary"}>
                      {schema.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <i className="fas fa-chevron-right text-muted-foreground"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
          <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-code text-4xl text-muted-foreground mb-4"></i>
              <p className="text-muted-foreground mb-2">Select a schema to edit or create a new one</p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(true);
                  setSchemaJson(JSON.stringify(defaultSchema, null, 2));
                }}
                data-testid="button-create-first-schema"
              >
                Create Your First Schema
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
