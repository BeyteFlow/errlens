module.exports = [
  {
    pattern: "is not defined",
    explanation: "You are trying to use a variable that hasn't been declared or is out of scope.",
    cause: "Commonly caused by typos, missing variable declarations (var/let/const), or trying to access a variable before it is defined.",
    fix: "Check for typos in the variable name. Ensure the variable is declared in the correct scope before accessing it."
  },
  {
    pattern: "is not a function",
    explanation: "You are trying to call a value as if it were a function, but the value is of a different type (like undefined, null, or a string).",
    cause: "Often happens when an object property is missing, or an asynchronous function returns an unexpected result.",
    fix: "Verify that the object or property you are calling is actually a function. Use 'typeof' to check if necessary."
  },
  {
    pattern: "Cannot read property of undefined",
    explanation: "You are trying to access a property on an object that is currently undefined.",
    cause: "The object you are accessing hasn't been initialized or the API response you expected is missing.",
    fix: "Use optional chaining (e.g., obj?.property) or add a null check before accessing the property."
  },
  {
    pattern: "Maximum call stack size exceeded",
    explanation: "Your code is hitting the recursion limit of the JavaScript engine.",
    cause: "Typically caused by an infinite loop in a recursive function or missing a base case.",
    fix: "Review your recursive function to ensure there is a clear exit condition and that it is reachable."
  },
  {
    pattern: "Unexpected token",
    explanation: "The JavaScript engine encountered a character it did not expect while parsing your code.",
    cause: "Missing closing braces, parentheses, or commas in your syntax.",
    fix: "Use an IDE with linting (like ESLint) to identify missing brackets or incorrect syntax patterns."
  }
];