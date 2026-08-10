const { findError } = require('../lib/matcher')

const tsErrors = [
  { input: "TS2322: Type 'number' is not assignable to type 'string'.", expected: "is not assignable to type" },
  { input: "Property 'name' does not exist on type 'User'.", expected: "does not exist on type" },
  { input: "Argument of type 'number' is not assignable to parameter of type 'string'.", expected: "is not assignable to parameter of type" },
  { input: "Module '\"./utils\"' has no exported member 'foo'.", expected: "has no exported member" },
  { input: "Object is possibly 'null'.", expected: "Object is possibly 'null'" },
  { input: "Object is possibly 'undefined'.", expected: "Object is possibly 'undefined'" },
  { input: "Parameter 'name' implicitly has an 'any' type.", expected: "implicitly has an 'any' type" },
  { input: "Not all code paths return a value.", expected: "Not all code paths return a value" },
  { input: "This comparison appears to be unintentional.", expected: "This comparison appears to be unintentional" },
  { input: "must have a 'Symbol.iterator' method that returns an iterator", expected: "must have a 'Symbol.iterator' method that returns an iterator" },
  { input: "Namespace 'React' has no exported member 'FC'.", expected: "has no exported member" },
  { input: "TS2554: Expected 2 arguments, but got 1.", expected: "arguments, but got" },
  { input: "No overload matches this call.", expected: "No overload matches this call" },
  { input: "Cannot find global type 'NodeJS'.", expected: "Cannot find global type" },
]

let passed = 0
let failed = 0

for (const { input, expected } of tsErrors) {
  const result = findError(input, 'en')
  if (result.count > 0) {
    const match = result.matches[0]
    const nameMatch = match.name.includes(expected) || match.match.includes(expected)
    if (nameMatch) {
      passed++
      console.log(`PASS: ${input.slice(0, 60)}...`)
    } else {
      failed++
      console.log(`FAIL (wrong match): ${input.slice(0, 60)}...`)
      console.log(`  Expected match containing: ${expected}`)
      console.log(`  Got: ${match.name}`)
    }
  } else {
    failed++
    console.log(`FAIL (no match): ${input.slice(0, 60)}...`)
  }
}

console.log(`\n--- TypeScript Error Matching ---`)
console.log(`Passed: ${passed}/${tsErrors.length}`)
console.log(`Failed: ${failed}/${tsErrors.length}`)

if (failed > 0) process.exit(1)
