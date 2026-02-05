// db/subscriber.db.js
const mongoose = require("mongoose");

const sagealphacapitalDB = mongoose.createConnection("mongodb://localhost:27017/sagealphacapital");

sagealphacapitalDB.on("connected", () => {
  console.log("✅ sagealpha capital DB connected (local)");
});

sagealphacapitalDB.on("error", (err) => {
  console.error("❌ sagealpha capital DB connection error:", err);
});

module.exports = sagealphacapitalDB;
