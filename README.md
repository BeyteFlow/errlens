# ErrLens 🔍  
> **Translate cryptic JavaScript errors into human-readable solutions instantly.**

<p align="center">
  <img src="assets/errlens.png" width="500">
</p>
</br>
</br>

<p align="center">
  <!-- GitHub Badges -->
  <img src="https://img.shields.io/github/stars/BeyteFlow/errlens?style=for-the-badge" alt="GitHub stars">
  <img src="https://img.shields.io/github/forks/BeyteFlow/errlens?style=for-the-badge" alt="GitHub forks">
  <img src="https://img.shields.io/github/issues/BeyteFlow/errlens?style=for-the-badge" alt="GitHub issues">
  <img src="https://img.shields.io/github/license/BeyteFlow/errlens?style=for-the-badge" alt="GitHub license">
  <img src="https://img.shields.io/github/issues-pr/BeyteFlow/errlens?style=for-the-badge" alt="Open PRs">
  
  <!-- npm Badges -->
  <br>
  <img src="https://img.shields.io/npm/v/errlens?style=for-the-badge" alt="npm version">
  <img src="https://img.shields.io/npm/dm/errlens?style=for-the-badge" alt="npm downloads">
  <img src="https://img.shields.io/github/v/tag/BeyteFlow/errlens?style=for-the-badge" alt="Git tag version">
  <img src="https://img.shields.io/node/v/errlens?style=for-the-badge" alt="Node.js version">
</p>
**ErrLens** is a professional-grade CLI utility designed to eliminate developer frustration. It intercepts Node.js crashes, analyzes stack traces, and delivers plain-English explanations with actionable fixes—directly in your terminal.

---
</br>
</br>
</br>
<p align="center">
  <img src="assets/terminal.png" width="800">
</p>
</br>
</br>

## 🌟 Key Features

- 🚀 **Instant Diagnostics** – No more context-switching to Google or StackOverflow.  
- 🔄 **Live Monitoring** – Catch errors in real-time using the `errlens run` command.  
- 🧠 **Fuzzy Logic Engine** – Matches messy stack traces and typos using `Fuse.js`.  
- 🎨 **Beautiful UI** – High-visibility terminal output powered by `boxen` and `chalk`.  
- 🤖 **CI/CD Ready** – Export raw data via `--json` for automated error reporting.  

---

## 📦 Installation

Install globally via npm to use the `errlens` command anywhere in your terminal:

```bash
npm install -g errlens
```

---

## ⚡ Quick Start

```bash
# Analyze an error message
errlens analyze "TypeError: Cannot read property 'name' of undefined"

# Run a script with error monitoring
errlens run your-script.js

# Get JSON output for CI/CD pipelines
errlens analyze "is not a function" --json
```

---

## 🛠 Usage

### Available Commands

```bash
errlens run <file> [--json]       # Run a script and analyze any crashes
errlens analyze <error> [--json]  # Analyze a specific error message
errlens --version                 # Show version information
errlens --help                    # Show help
```

### 1️⃣ Automatic Monitoring (The "Pro" Way)

Run your script through ErrLens. If it crashes, ErrLens intercepts the error and explains the fix before the process exits.

```bash
errlens run your-app.js
```

---

### 2️⃣ Manual Analysis

Found a weird error in your logs? Just paste the message:

```bash
errlens analyze "TypeError: Cannot read properties of undefined"
```

---

### 3️⃣ Pipeline Integration

Get machine-readable results for your own tooling or automated reports:

```bash
errlens analyze "is not a function" --json
```

Run a script and write the JSON report directly to a file in CI:

```bash
errlens run test.js --json > ci-report.json
```

In `--json` mode, ErrLens prints only JSON (no spinner, colors, or terminal boxes).

Example response from `run`:

```json
{
  "code": 0,
  "count": 0,
  "matches": []
}
```

Example response from `analyze <errorString>` (match found):

```json
{
  "code": 1,
  "count": 1,
  "matches": [
    {
      "name": "TypeError: Cannot read properties of undefined",
      "match": "Cannot read properties of undefined",
      "explanation": "You are trying to access a property on a variable that is currently empty.",
      "why": "The variable wasn't initialized, or an API call hasn't finished yet.",
      "fixes": [
        "Use optional chaining: user?.name",
        "Set a default value: data || []"
      ],
      "example": "const name = user?.name || 'Guest';"
    }
  ]
}
```

Exit codes (useful for CI):

- `run <file>` exits with the child process exit code.
- `analyze <errorString>` exits with `1` when matches are found (intentional, so CI can fail when known errors are detected), otherwise `0`.

This follows Unix conventions where `0` means success and non-zero means failure. If you prefer success-on-detection in CI, invert the check in your pipeline logic (for example, treat exit code `1` from `analyze <errorString>` as a pass condition).

---

## 🧠 System Architecture

ErrLens operates on a three-stage intelligent pipeline to turn confusion into clarity:

| Phase          | Component       | Description |
|---------------|----------------|-------------|
| Interception  | `auto.js`      | Hooks into the `uncaughtException` event via a preload script. |
| Matching      | `matcher.js`   | Uses fuzzy search against `database.json` to find the root cause. |
| Formatting    | `formatter.js` | Wraps the diagnosis in a clean, color-coded terminal interface. |

---

## 📁 Project Structure

```
errlens/
├── bin/index.js       # CLI Entry point & Command routing
├── lib/
│   ├── matcher.js     # Fuzzy search & Logic engine
│   ├── formatter.js   # UI & Terminal styling
│   ├── auto.js        # Automation & Error interception
│   └── database.json  # The "Knowledge Base" (Dictionary)
├── package.json       # Dependencies & Metadata
└── README.md          # Documentation
```

---

## 🤝 Contributing

We are building the world's most comprehensive dictionary of JavaScript errors, and we need your help!

1. Fork the repository.  
2. Add a new error entry to `lib/database.json`.  
3. Submit a Pull Request.  

💡 **Tip:** Every error you add helps another developer save valuable time. Join the mission!

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <b>BeyteFlow</b><br>
  <i>Making the terminal a friendlier place, one error at a time.</i>
</p>
