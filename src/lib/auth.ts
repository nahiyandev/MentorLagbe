import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  _mentorLagbeMongoClient?: MongoClient;
};

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is required.");
}

const client =
  globalForMongo._mentorLagbeMongoClient ??
  new MongoClient(mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

globalForMongo._mentorLagbeMongoClient = client;

const db = client.db("mentorlagbe");

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

export const auth = betterAuth({
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
            typeof user.role === "string" ? user.role.toLowerCase() : "student";
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

export type Session = typeof auth.$Infer.Session;
