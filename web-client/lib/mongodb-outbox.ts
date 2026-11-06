import { MongoClient, Db } from "mongodb";

const DEFAULT_MONGODB_URI =
  "mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/ecommerce_db?retryWrites=true&w=majority";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getAtlasDb(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  cachedClient = client;
  cachedDb = client.db("ecommerce_db");
  return cachedDb;
}

export async function saveOrderToAtlas(order: any): Promise<void> {
  try {
    const db = await getAtlasDb();
    await db.collection("orders").updateOne(
      { id: order.id },
      { $set: { ...order, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn("Failed to persist order to MongoDB Atlas:", error?.message);
  }
}

export async function saveOutboxEventToAtlas(
  topic: string,
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  payload: any
): Promise<void> {
  try {
    const db = await getAtlasDb();
    const eventDoc = {
      aggregateType,
      aggregateId,
      eventType,
      topic,
      payload: typeof payload === "string" ? payload : JSON.stringify(payload),
      status: "PENDING",
      retryCount: 0,
      createdAt: new Date(),
      publishedAt: null,
      _class: "com.company.orderservice.domain.entity.OutboxEventEntity",
    };

    await db.collection("outbox_events").insertOne(eventDoc);
    console.log(`[Outbox] Persisted pending event ${eventType} to ${topic} (id: ${aggregateId})`);
  } catch (error: any) {
    console.warn("Failed to write event to MongoDB Atlas Outbox:", error?.message);
  }
}
