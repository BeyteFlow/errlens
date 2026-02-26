const Fuse = require("fuse.js");
const database = require("./database.json");

function findError(input) {
  if (!input) return null;

  // Clean the input:
  // 1. Take only the first line (the error message).
  // 2. Remove common noise like 'Uncaught' or file paths.
  const coreError = input.split('\n')[0]
    .replace(/^Uncaught\s+/, '')
    .split(' at ')[0]
    .trim();

  const fuse = new Fuse(database, {
    keys: ["match", "name"],
    threshold: 0.4, // Balance between strict and loose
    distance: 100
  });

  const result = fuse.search(coreError);
  return result.length > 0 ? result[0].item : null;
}

module.exports = { findError };