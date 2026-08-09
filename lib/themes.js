"use strict";

const THEMES = {
  default: {
    label: "default",
    border: "cyan",
    title: "cyan",
    id: "cyan",
    whatLabel: "yellow",
    whyLabel: "magenta",
    fixesLabel: "green",
    fixCheck: "green",
    exampleLabel: "blue",
    exampleCode: "gray",
    headerText: "cyan",
    successText: "green",
    errorText: "red",
    signalText: "red",
    rawText: "gray",
    unknownText: "red",
    infoLabel: "cyan",
    asyncLabel: "magenta",
    protectionText: "dim",
  },
  minimal: {
    label: "minimal",
    border: "gray",
    title: "gray",
    id: "white",
    whatLabel: "white",
    whyLabel: "white",
    fixesLabel: "white",
    fixCheck: "white",
    exampleLabel: "white",
    exampleCode: "gray",
    headerText: "white",
    successText: "white",
    errorText: "white",
    signalText: "white",
    rawText: "gray",
    unknownText: "white",
    infoLabel: "white",
    asyncLabel: "white",
    protectionText: "gray",
  },
  "high-contrast": {
    label: "high-contrast",
    border: "white",
    title: "white",
    id: "whiteBright",
    whatLabel: "yellowBright",
    whyLabel: "magentaBright",
    fixesLabel: "greenBright",
    fixCheck: "greenBright",
    exampleLabel: "cyanBright",
    exampleCode: "white",
    headerText: "cyanBright",
    successText: "greenBright",
    errorText: "redBright",
    signalText: "redBright",
    rawText: "white",
    unknownText: "redBright",
    infoLabel: "cyanBright",
    asyncLabel: "magentaBright",
    protectionText: "white",
  },
  dracula: {
    label: "dracula",
    border: "magenta",
    title: "magenta",
    id: "cyan",
    whatLabel: "green",
    whyLabel: "red",
    fixesLabel: "yellow",
    fixCheck: "green",
    exampleLabel: "cyan",
    exampleCode: "gray",
    headerText: "magenta",
    successText: "green",
    errorText: "red",
    signalText: "red",
    rawText: "gray",
    unknownText: "red",
    infoLabel: "cyan",
    asyncLabel: "magenta",
    protectionText: "gray",
  },
  monokai: {
    label: "monokai",
    border: "yellow",
    title: "yellow",
    id: "cyan",
    whatLabel: "green",
    whyLabel: "magenta",
    fixesLabel: "cyan",
    fixCheck: "green",
    exampleLabel: "yellow",
    exampleCode: "gray",
    headerText: "yellow",
    successText: "green",
    errorText: "red",
    signalText: "red",
    rawText: "gray",
    unknownText: "red",
    infoLabel: "cyan",
    asyncLabel: "magenta",
    protectionText: "gray",
  },
};

const THEME_NAMES = Object.keys(THEMES);

function resolveTheme(name) {
  if (typeof name !== "string") return THEMES.default;
  const normalized = name.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(THEMES, normalized)) {
    return THEMES[normalized];
  }
  return THEMES.default;
}

function isValidTheme(name) {
  if (!name) return true;
  return THEME_NAMES.includes(name.toLowerCase());
}

module.exports = { THEMES, THEME_NAMES, resolveTheme, isValidTheme };
