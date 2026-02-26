// lib/auto.js
const { findError } = require("./matcher");
const { formatError } = require("./formatter");

// This listens for any crash that wasn't caught by a try/catch
process.on("uncaughtException", (err) => {
  const result = findError(err.message);
  
  if (result) {
    console.log("\n--- ErrLens Auto-Detection ---");
    console.log(formatError(result));
  } else {
    console.error(err);
  }
  process.exit(1);
});