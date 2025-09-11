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
- Serve both frontend and backend from `http://localhost:5000`

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

The application uses Replit's built-in PostgreSQL database for development. No additional setup required.

### Production Database

For production, configure your PostgreSQL connection:

1. **Push database schema:**
```bash
npm run db:push
```

2. **Environment variables:**
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

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
│   │   └── lib/            # Utilities and hooks
│   └── index.html          # HTML template
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── graphql.ts         # GraphQL setup
│   ├── storage.ts         # Database layer
│   └── vite.ts            # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schemas
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

### Netlify Deployment

This project is configured for seamless deployment on Netlify with serverless functions:

1. **Connect your repository** to Netlify
2. **Build settings** are automatically configured via `netlify.toml`
3. **Environment variables** can be set in Netlify dashboard under Site settings → Environment variables

#### Required Environment Variables for Netlify:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
```

The `netlify.toml` configuration handles:
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

- **Homepage:** `http://localhost:5000`
- **Documentation:** `http://localhost:5000/docs`
- **Live Demo:** `http://localhost:5000/dashboard`
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