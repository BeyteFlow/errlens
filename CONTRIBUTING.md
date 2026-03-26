# Contributing Guide

Thank you for your interest in contributing to this project! 🎉
We welcome contributions from everyone—whether you're fixing bugs, improving documentation, or adding new features.

---

## 📌 Getting Started

### 1. Fork the Repository

* Click the **Fork** button at the top right of this repository.
* This creates a copy of the project under your GitHub account.

### 2. Clone Your Fork

```bash
git clone https://github.com/BeyteFlow/errlens
cd errlens
```

### 3. Set Up the Project

**Prerequisites:** Node.js **v20.0.0 or higher** is required (see `engines` field in `package.json`). No Docker, database, or `.env` file is needed.

```bash
# Install dependencies using npm
npm install

# Verify the CLI works locally
node bin/index.js --version

# Run the test suite
npm test
# which runs: node --test test/**/*.test-lang.js
```

> **Note:** There is no dev server to start — ErrLens is a CLI tool. After `npm install`, use `node bin/index.js` in place of the `errlens` command to test your changes locally.

---

## 🌱 Creating a Branch

Always create a new branch before making changes:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

* `feature/...` for new features
* `fix/...` for bug fixes
* `docs/...` for documentation updates

---

## ✏️ Making Changes

* Keep your changes small and focused.
* Write clear and meaningful commit messages.

Example:

```bash
git commit -m "Add user authentication feature"
```

---

## 🎯 Coding Standards

Please follow these general guidelines:

* Write clean and readable code
* Use meaningful variable and function names
* Follow consistent formatting
* Add comments where necessary
* Keep functions small and modular

### Best Practices

* Avoid code duplication
* Write reusable components/functions
* Handle errors gracefully
* Ensure your code does not break existing functionality

---

## ✅ Testing

Before submitting your changes:

* Run existing tests (if available)
* Add new tests for new features (if applicable)
* Make sure everything works as expected

---

## 📤 Submitting a Pull Request

### 1. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 2. Open a Pull Request

* Go to your fork on GitHub
* Click **Compare & Pull Request**
* Provide a clear description of your changes

### 3. Pull Request Guidelines

* Describe what you changed and why
* Reference related issues (if any)
* Keep PRs focused and concise

---

## 🐛 Reporting Issues

When creating an issue, please include:

* A clear and descriptive title
* Steps to reproduce the issue
* Expected vs actual behavior
* Screenshots (if applicable)

---

## 🔄 Contribution Workflow

1. Fork the repository
2. Clone your fork
3. Create a new branch
4. Make your changes
5. Commit and push
6. Submit a Pull Request
7. Address review feedback (if any)

---

## 📜 Project-Specific Rules

* Do not commit sensitive information (API keys, passwords, etc.)
* Keep dependencies minimal and necessary
* Update documentation when needed
* Follow existing project structure and patterns

---

## 🙌 Thank You!

Your contributions help improve this project for everyone.
We appreciate your time and effort! 🚀
