import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { ensureAllJobRoles } from "./ensureJobRoles";
import { migrateCompetencyDepartmentTypes, migrateActivateExistingUsers, migrateEngineeringDepartmentModel } from "./migrations";
import { pool } from "./db";

// Ensure the session store table exists. We do this explicitly because
// connect-pg-simple's `createTableIfMissing` relies on a bundled SQL file
// that esbuild does not include in the production bundle.
async function ensureSessionTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user_sessions" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE);
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "IDX_user_sessions_expire" ON "user_sessions" ("expire");`
  );
}

async function ensureEmailAuthCodesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "email_auth_codes" (
      "id" serial PRIMARY KEY,
      "user_id" varchar(50) NOT NULL,
      "email" text NOT NULL,
      "code_hash" text NOT NULL,
      "expires_at" text NOT NULL,
      "attempt_count" integer NOT NULL DEFAULT 0,
      "consumed_at" text,
      "created_at" text NOT NULL,
      "request_ip" text,
      "user_agent" text
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "IDX_email_auth_codes_user_id" ON "email_auth_codes" ("user_id");`
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS "IDX_email_auth_codes_email" ON "email_auth_codes" ("email");`
  );
}

const app = express();
const httpServer = createServer(app);

// Required when running behind Railway / any HTTPS reverse proxy so that
// `secure` cookies are honoured and req.protocol reflects the original scheme.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const PgSessionStore = connectPgSimple(session);

const sessionMaxAgeMs =
  parseInt(process.env.SESSION_MAX_AGE_HOURS || "12", 10) * 60 * 60 * 1000;

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionMaxAgeMs,
    },
  }),
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  await ensureSessionTable();
  await ensureEmailAuthCodesTable();
  await ensureAllJobRoles();
  await migrateCompetencyDepartmentTypes();
  await migrateEngineeringDepartmentModel();
  await migrateActivateExistingUsers();
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOptions = process.platform === "win32"
    ? {
        port,
        host: "0.0.0.0",
      }
    : {
        port,
        host: "0.0.0.0",
        reusePort: true,
      };

  httpServer.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
