# AutoCRUD Core Demo

A comprehensive full-stack demonstration website showcasing the **AutoCRUD Core** library - an auto-generated CRUD REST + GraphQL API system that instantly creates endpoints from JSON schemas.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (for production) or use built-in development database

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd autocrud-core-demo
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database configuration
```

## 🏃‍♂️ Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

This will:
- Start the Express server on port 5000
- Launch Vite dev server for the frontend
- Enable hot module replacement (HMR)
- Serve both frontend and backend from `http://0.0.0.0:5000`

### Production Build

1. **Build the application:**
```bash
npm run build
```

This command:
- Builds the React frontend with Vite
- Bundles the Express server with esbuild
- Outputs production files to `dist/` directory

2. **Start production server:**
```bash
npm run start
```

The production server runs on port 5000 and serves the built application.

## 🗄️ Database Setup

### Development Database

The application uses a file-based database for development, storing data in JSON files in the `data/` directory. No additional setup required.

### Production Database

The application supports multiple database adapters:
- **File-based** (default): JSON files in `data/` directory
- **PostgreSQL**: Configure with `DATABASE_URL`
- **SQLite**: Use `better-sqlite3` adapter
- **MongoDB**: Use MongoDB adapter

For production with PostgreSQL:

1. **Environment variables:**
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

2. **Update autocrud config** to use PostgreSQL adapter

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

## 📁 Project Structure

```
autocrud-core-demo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── homepage/   # Homepage components
│   │   │   ├── navigation/ # Navigation components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities and services
│   │   ├── App.tsx         # Main App component
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles
│   └── index.html          # HTML template
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── autocrud.config.ts # AutoCRUD configuration
│   └── vite.ts            # Vite integration
├── schemas/               # JSON schema definitions
│   ├── user.json          # User schema
│   ├── product.json       # Product schema
│   ├── order.json         # Order schema
│   ├── metric.json        # Metric schema
│   └── schema.json        # Schema entity schema
├── data/                  # File-based database storage
├── shared/                # Shared types and schemas
│   └── schema.ts          # TypeScript schema definitions
├── netlify.toml           # Netlify deployment config
└── package.json           # Dependencies and scripts
```

## 🎯 Features Demonstrated

- **REST API Generation** - Auto-generated endpoints from schemas
- **GraphQL API** - Complete GraphQL schema with queries and mutations
- **Interactive Documentation** - Live API explorer and playground
- **Real-time Metrics** - Performance monitoring and analytics
- **Schema Builder** - Visual schema creation tool
- **Multiple Database Support** - File, SQLite, PostgreSQL, MongoDB adapters

## 🧪 Development

### Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend:** Express.js, TypeScript, Apollo Server
- **Database:** PostgreSQL, Drizzle ORM
- **State Management:** TanStack Query (React Query)
- **Routing:** Wouter (client-side)

### Environment Setup

The application automatically configures itself based on the `NODE_ENV`:

- **Development:** `NODE_ENV=development` - Enables Vite dev server, hot reload
- **Production:** `NODE_ENV=production` - Serves static files, optimized build

## 🚀 Deployment

### Building for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm run start
```

### Replit Deployment

This project is optimized for deployment on Replit:

1. **Fork or import** this repository into Replit
2. **Run the project** using the Run button or `npm run dev`
3. **Environment variables** can be set in the Secrets tab
4. **Automatic deployment** - Changes are instantly deployed

#### Optional Environment Variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://... (if using PostgreSQL)
```

### External Deployment (Netlify/Vercel)

The project includes `netlify.toml` for external deployment:
- Automatic builds with `npm run build`
- Serverless function routing for `/api/*` endpoints
- GraphQL endpoint routing for `/graphql`
- SPA routing with fallback to `index.html`
- CORS headers for API endpoints

### Environment Variables

Required environment variables for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=5000
```

## 📖 API Documentation

Once running, visit:

- **Homepage:** `http://0.0.0.0:5000`
- **Documentation:** `http://0.0.0.0:5000/docs`
- **Live Demo:** `http://0.0.0.0:5000/dashboard`
- **GraphQL Playground:** Available in the dashboard
- **REST API Explorer:** Available in the dashboard

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vaibhav Ramawat**

- GitHub: [@vaibhavr2107](https://github.com/vaibhavr2107)
- NPM: [autocrud-core](https://www.npmjs.com/package/autocrud-core)

---

For more information about the AutoCRUD Core library, visit the [official documentation](https://www.npmjs.com/package/autocrud-core) or check out the [GitHub repository](https://github.com/vaibhavr2107/autocrud).