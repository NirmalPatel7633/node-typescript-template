import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import express, { Express, Request, Response, NextFunction } from "express";
import {
  node_env,
  cors_allow,
  cors_url,
  api_prefix,
  api_version,
} from "./config/appConfig";
import path from "node:path";
import { routes as route } from "./routes/index";
const { dbReader, dbWriter } = require("./config/dbConfig");
export const app: Express = express();

// CORS Configuration
const Cors = cors({
  origin: (requestOrigin, callback) => {
    // No Origin header = Postman / mobile app / server-to-server — always allow
    if (!requestOrigin) {
      return callback(null, true);
    }
    // Local: allow everything when CORS_ALLOW_ALL=true
    if (cors_allow) {
      return callback(null, true);
    }
    // Production: strict whitelist check
    if (cors_url.includes(requestOrigin)) {
      return callback(null, true);
    }
    callback(
      new Error(`CORS blocked: origin '${requestOrigin}' is not allowed`),
    );
  },
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "platform-type",
    "device-model",
    "device-token",
  ],
  credentials: true,
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware Configuration
const setupMiddlewares = () => {
  app.set("trust proxy", 1);
  // app.use(morgan('combined'));
  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
};

// Base Route configuration
type RouteClass = new (app: Express, basePath: string) => any;
const APIPrefix = `/${api_prefix}/${api_version}`;

// API Configuration
const setupAPI = () => {
  // API's
  const routes: Array<[string, RouteClass]> = [["auth", route.authRoutes]];
  // Admin API's
  const adminRoutes: Array<[String, RouteClass]> = []; 
  // API's
  for (const [path, RouteClass] of routes) {
    app.use(`${APIPrefix}/${path}`, Cors, apiRateLimiter);
    new RouteClass(app, `${APIPrefix}/${path}`);
  }
  // Admin API's
  for (const [path, RouteClass] of adminRoutes) {
    app.use(`${APIPrefix}/admin/${path}`, Cors, apiRateLimiter);
    new RouteClass(app, `${APIPrefix}/admin/${path}`);
  }
  // Public API's
  // app.use(`${APIPrefix}/public`, Cors);
  // new PublicRoute(app, `${APIPrefix}/public`);
};

// Error Handling
const setupErrorHandling = () => {
  // 404 handler
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new Error("Route not found"));
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (node_env === "development" || node_env === "local") {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  });
};

// Database Configuration
const checkDatabase = async () => {
  await dbReader.sequelize.authenticate();
  await dbWriter.sequelize.authenticate();
  console.log(`${node_env} database connected successfully`);
};

export const bootstrap = async (): Promise<Express> => {
  try {
    await checkDatabase();
    setupMiddlewares();
    setupAPI();
    setupErrorHandling();
    return app;
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};
