// src/lib/auth.ts
// BetterAuth — email/password login, MongoDB-তে user/session save হবে
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db(); // URI-র database-টাই use হবে (mentorlagbe)

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    // doc-এর users collection-এর extra fields
    additionalFields: {
      role: { type: "string", defaultValue: "student", required: false },
      phone: { type: "string", required: false },
      bio: { type: "string", required: false },
      plan: { type: "string", defaultValue: "free", required: false },
    },
  },
});
