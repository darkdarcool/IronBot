import { MongoClient, ServerApiVersion } from "mongodb";
import { loadEnv } from "../utils/loadenv.js";
loadEnv();

let client: MongoClient;

const uri = `mongodb+srv://admin:${process.env.MONGO_PASSWORD}@cluster0.1wzz8q2.mongodb.net/?retryWrites=true&w=majority`;
let mongoclient = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
await mongoclient.connect();
console.log("Connected to MongoDB");
client = mongoclient;


export async function getDB(dbName: "dev" | "prod") {
  return client.db(dbName);
}