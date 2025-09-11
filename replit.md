# Overview

AutoCRUD Core is a full-stack web application that demonstrates an auto-generated CRUD REST + GraphQL API system. The application provides a live demo environment where users can interact with schema-based API generation, REST endpoint exploration, GraphQL queries, and real-time performance monitoring. The system automatically generates complete APIs from JSON schemas, supporting multiple database adapters and providing comprehensive observability features.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design system
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Component Structure**: Modern functional components with hooks-based architecture

**Key Design Decisions**:
- Chose Vite over Create React App for faster development and build times
- Selected shadcn/ui for consistent, accessible UI components with customizable theming
- Implemented TanStack Query for efficient API state management and automatic caching

## Backend Architecture

**Framework**: Express.js with TypeScript running in ES module mode
- **API Paradigms**: Dual REST and GraphQL endpoints generated from shared schemas
- **GraphQL Integration**: Apollo Server Express for GraphQL endpoint with introspection enabled
- **Database Layer**: Drizzle ORM with PostgreSQL using Neon serverless database
- **Schema Management**: Centralized schema definitions in `shared/schema.ts` using Drizzle schema builder

**Key Design Decisions**:
- Implemented both REST and GraphQL APIs to demonstrate different consumption patterns
- Used Drizzle ORM for type-safe database operations and automatic migration generation
- Chose PostgreSQL for production-ready relational data storage with JSON support for flexible schemas
- Integrated performance metrics collection for API observability

## Data Storage Architecture

**Primary Database**: PostgreSQL via Neon serverless platform
- **ORM**: Drizzle with automatic migration generation via drizzle-kit
- **Schema Structure**: Five main entities - users, products, orders, schemas, and metrics
- **Relationships**: Proper foreign key relationships between users, products, and orders
- **Indexing**: Automatic UUID generation for primary keys and timestamp tracking

**Key Design Decisions**:
- Selected PostgreSQL for ACID compliance and complex query support
- Used Drizzle for compile-time type safety and excellent TypeScript integration
- Implemented UUID primary keys for distributed system scalability
- Added performance metrics table for real-time monitoring capabilities

## Build and Development Architecture

**Development**: Hot module replacement with Vite dev server integration
- **Production Build**: Separate client (Vite) and server (esbuild) build processes
- **Type Safety**: Shared TypeScript types between client and server via `shared/` directory
- **Path Mapping**: Consistent alias resolution for clean imports across the codebase

**Key Design Decisions**:
- Used esbuild for server bundling to match Vite's performance characteristics
- Implemented shared type definitions to ensure client-server type consistency
- Created development middleware that serves both APIs and frontend from single server

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM with automatic migrations
- **apollo-server-express**: GraphQL server implementation
- **@tanstack/react-query**: Client-side state management and API caching

## UI and Styling Libraries
- **@radix-ui/**: Complete accessible component primitives (30+ components)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Consistent icon set

## Development and Build Tools
- **vite**: Fast frontend build tool with HMR
- **esbuild**: High-performance server bundling
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error reporting in Replit environment

## Database and Schema Management
- **drizzle-kit**: Database migration and introspection tools
- **zod**: Runtime type validation and schema parsing
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

## Additional Integrations
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Efficient form state management
- **date-fns**: Date manipulation utilities
- **nanoid**: Secure random ID generation