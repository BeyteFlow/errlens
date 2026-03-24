const database = require("./database.json");
const fs = require('fs')
const path = require("path");

// Loading the locale file 
function loadLocale(lang = "en"){
  const filepath = path.join(__dirname,"../locales", `${lang}.json`);
  const fallback = path.join(__dirname,"../locales/en.json");
  try {
    return JSON.parse(fs.readFileSync(filepath,"utf8"))
  } catch (error) {
    return JSON.parse(fs.readFileSync(fallback,"utf8"))
    
  }
}

//this function will translate every single entry using the loaded locals
function translateEntry(entry,locale){
  const key = entry.match
  return{
    ...entry,
    explanation:locale[`${key}__explanation`] || entry.explanation,
    why: locale[`${key}__why`] || entry.why,
    fixes: entry.fixes.map(
      (fix,i) =>locale[`${key}__fix_${i}`] || fix
    )
  }
}


function findError(input,lang = "en") {
  
  if (!input) return { count: 0, matches: [] };

  if (typeof input !== "string") input = String(input);

  // 1. Normalize the input (Lowercase and remove extra whitespace)
  const lowerInput = input.toLowerCase();


  const locale = loadLocale(lang) // I'm calling the load local file here
 
  //untouched
  // 2. Filter the database
  let foundMatches = database.filter(entry => {
    const matchPhrase = entry.match.toLowerCase();
    
    // STRICT CHECK: The phrase must exist in the error log
    return lowerInput.includes(matchPhrase);
  });

  // 3. SPECIFICITY SORTING (The Secret Sauce)
  // If we find "Cannot read properties of undefined" AND "TypeError", 
  // we want the longer, more specific one to show up first.
  foundMatches.sort((a, b) => b.match.length - a.match.length);

  // 4. DEDUPLICATION
  // Ensure we don't show the same category twice
  const uniqueMatches = [];
  const seenNames = new Set();

  for (const match of foundMatches) {
    if (!seenNames.has(match.name)) {
      uniqueMatches.push(translateEntry(match,locale));
      seenNames.add(match.name);
    }
  }

  return {
    count: uniqueMatches.length,
    matches: uniqueMatches
  };
}

module.exports = { findError };