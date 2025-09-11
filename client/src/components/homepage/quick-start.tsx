import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickStart() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const steps = [
    {
      title: "Install AutoCRUD Core",
      description: "Get started with the main package and optional database adapters",
      commands: [
        "npm install autocrud-core",
        "npm install better-sqlite3"
      ],
      optional: "Optional: Install database adapter for SQLite support"
    },
    {
      title: "Define Your Schema", 
      description: "Create a JSON schema file defining your data structure",
      code: `{
  "name": "user",
  "primaryKey": { "name": "id", "auto": true, "strategy": "uuid" },
  "timestamps": true,
  "fields": {
    "id": { "type": "string", "required": true },
    "email": { "type": "string", "required": true },
    "name": { "type": "string" }
  }
}`
    },
    {
      title: "Start Your Server",
      description: "Configure and launch your API server with one function call",
      code: `import { buildAutoCRUD } from 'autocrud-core';

const config = {
  server: { port: 4000 },
  database: { type: 'file', url: './data' },
  schemas: {
    user: { file: './schemas/user.json' }
  }
};

const app = await buildAutoCRUD(config);
await app.start();`
    }
  ];

  return (
    <section id="quickstart" className="py-20 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Get Started in Minutes</h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to have your CRUD APIs up and running
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <Card key={step.title} className="overflow-hidden" data-testid={`step-${index + 1}`}>
              <CardHeader>
                <div className="flex items-start">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mr-6 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-3">{step.title}</CardTitle>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-16">
                {step.commands ? (
                  <div className="space-y-4">
                    {step.commands.map((command, cmdIndex) => (
                      <div key={cmdIndex} className="bg-muted p-4 rounded-lg code-font text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">{command}</span>
                          <button
                            onClick={() => copyToClipboard(command)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            data-testid={`copy-command-${cmdIndex}`}
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    {step.optional && (
                      <p className="text-muted-foreground text-sm">{step.optional}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg code-font text-sm">
                    <pre className="text-foreground whitespace-pre-wrap">{step.code}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">
            That's it! Your REST and GraphQL APIs are now running at{" "}
            <span className="code-font text-primary">http://localhost:4000</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="https://www.npmjs.com/package/autocrud-core"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              data-testid="button-view-npm"
            >
              View on NPM
            </a>
            <a
              href="https://github.com/vaibhavr2107/autocrud"
              className="border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-card transition-colors"
              data-testid="button-view-source"
            >
              <i className="fab fa-github mr-2"></i>View Source
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
