import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "https://mentor-lagbe.vercel.app",
      process.env.BETTER_AUTH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ].filter((origin): origin is string => Boolean(origin))
  )
);

const resolvedBaseURL = process.env.VERCEL
  ? process.env.BETTER_AUTH_URL &&
    !process.env.BETTER_AUTH_URL.includes("localhost")
    ? process.env.BETTER_AUTH_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://mentor-lagbe.vercel.app"
  : process.env.BETTER_AUTH_URL || "http://localhost:3000";

function createAuthInstance(client: MongoClient) {
  const db = client.db("mentorlagbe");

  return betterAuth({
    database: mongodbAdapter(db, {
      client,
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: resolvedBaseURL,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders: {
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            },
          }
        : {}),
    },
    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "student",
          required: false,
          input: true,
        },
        phone: {
          type: "string",
          defaultValue: "",
          required: false,
          input: true,
        },
        bio: {
          type: "string",
          defaultValue: "",
          required: false,
          input: true,
        },
        plan: {
          type: "string",
          defaultValue: "free",
          required: false,
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const requestedRole =
              typeof user.role === "string"
                ? user.role.toLowerCase()
                : "student";
            const safeRole = requestedRole === "tutor" ? "tutor" : "student";
            return {
              data: {
                ...user,
                role: safeRole,
                plan: "free",
                phone: typeof user.phone === "string" ? user.phone : "",
                bio: typeof user.bio === "string" ? user.bio : "",
              },
            };
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

export type AuthInstance = ReturnType<typeof createAuthInstance>;
export type Session = AuthInstance["$Infer"]["Session"];

type MongoClientWithTopology = MongoClient & {
  topology?: {
    isDestroyed?: () => boolean;
    isConnected?: () => boolean;
  };
};

const globalForAuth = globalThis as typeof globalThis & {
  _mentorLagbeClient?: MongoClientWithTopology;
  _mentorLagbeConnectPromise?: Promise<MongoClientWithTopology>;
  _mentorLagbeAuth?: AuthInstance;
};

function isClientHealthy(client?: MongoClientWithTopology): boolean {
  if (!client) return false;
  if (client.topology?.isDestroyed?.()) return false;
  return true;
}

async function getConnectedClient(): Promise<MongoClientWithTopology> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required.");
  }

  if (
    isClientHealthy(globalForAuth._mentorLagbeClient) &&
    globalForAuth._mentorLagbeConnectPromise
  ) {
    try {
      const existing = await globalForAuth._mentorLagbeConnectPromise;
      if (isClientHealthy(existing)) {
        return existing;
      }
    } catch {
      // Fall through to recreate a clean client
    }
  }

  globalForAuth._mentorLagbeAuth = undefined;
  const freshClient = new MongoClient(mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  }) as MongoClientWithTopology;

  globalForAuth._mentorLagbeClient = freshClient;
  const connectPromise = freshClient
    .connect()
    .then(() => freshClient)
    .catch((err) => {
      if (globalForAuth._mentorLagbeClient === freshClient) {
        globalForAuth._mentorLagbeClient = undefined;
        globalForAuth._mentorLagbeConnectPromise = undefined;
        globalForAuth._mentorLagbeAuth = undefined;
      }
      throw err;
    });

  globalForAuth._mentorLagbeConnectPromise = connectPromise;
  return connectPromise;
}

export async function getAuth(): Promise<AuthInstance> {
  const client = await getConnectedClient();
  if (!globalForAuth._mentorLagbeAuth) {
    globalForAuth._mentorLagbeAuth = createAuthInstance(client);
  }
  return globalForAuth._mentorLagbeAuth;
}
