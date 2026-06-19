import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const collectionName = process.env.MONGODB_COLLECTION ?? "pockets";

if (!uri || !dbName) {
  console.error("Set MONGODB_URI and MONGODB_DB in .env.local before seeding.");
  process.exit(1);
}

const samplePockets = [
  { name: "Snacks", amount: 45, color: "pocketYellow", icon: "pizza" },
  { name: "Rent", amount: 1200, color: "pocketBlue", icon: "home" },
  { name: "Fun", amount: 200, color: "pocketGreen", icon: "gamepad" },
  { name: "Savings", amount: 3500, color: "pocketTeal", icon: "disk" },
  { name: "Coffee", amount: 30, color: "pocketYellow", icon: "coffee" },
  { name: "Emergency", amount: 500, color: "pocketRed", icon: "heart" },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const collection = client.db(dbName).collection(collectionName);
  const existing = await collection.countDocuments();

  if (existing > 0) {
    console.log(`Collection "${collectionName}" already has ${existing} document(s). Skipping seed.`);
    process.exit(0);
  }

  const result = await collection.insertMany(samplePockets);
  console.log(`Seeded ${result.insertedCount} pockets into "${collectionName}".`);
} catch (error) {
  console.error("Seed failed:", error);
  process.exit(1);
} finally {
  await client.close();
}
