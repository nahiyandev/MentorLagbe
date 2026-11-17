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
  globalForMongo._mentorLagbeMongoClient ?? new MongoClient(mongoUri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mentorLagbeMongoClient = client;
}

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
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
