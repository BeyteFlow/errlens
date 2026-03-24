const { findError } = require('../lib/matcher')

const languages = ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'pt']
const testError = "Cannot read properties of undefined"

for (const lang of languages) {
  console.log(`\n--- ${lang.toUpperCase()} ---`)
  const result = findError(testError, lang)
  if (result.matches.length > 0) {
    const match = result.matches[0]
    console.log('explanation:', match.explanation)
    console.log('why:        ', match.why)
    console.log('fixes:      ', match.fixes)
  }
}