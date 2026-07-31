import mongoose from "mongoose";

async function backfill() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  const collection = db.collection("leads");

  const result = await collection.updateMany(
    { source: { $exists: false } },
    { $set: { source: "Website", connectorId: null } }
  );

  console.log(`Updated ${result.modifiedCount} documents (source=Website, connectorId=null)`);

  const alreadySet = await collection.updateMany(
    { source: { $exists: true }, connectorId: { $exists: false } },
    { $set: { connectorId: null } }
  );

  console.log(`Set connectorId=null on ${alreadySet.modifiedCount} additional documents`);

  await mongoose.disconnect();
  console.log("Backfill complete.");
}

backfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
