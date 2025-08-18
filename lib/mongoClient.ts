// lib/mongoClient.ts
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export const clientPromise =
  global._mongoClientPromise ?? client.connect();

if (!global._mongoClientPromise) global._mongoClientPromise = clientPromise;
