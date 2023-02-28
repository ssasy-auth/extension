/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
  root: true,
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting"
  ],
  parserOptions: {
    ecmaVersion: "latest"
  },
  rules: {
    /* ================ linting ================ */
    // disables the no-unused-vars rule
    "no-unused-vars": [ "off" ],
    // forces the use of const or let instead of var
    "no-var": [ "error" ],

    /* ================ formatting ================ */
    // use 2 spaces for indentation
    "indent": [ "error", 2 ],
    // use double quotes
    "quotes": [ "error", "double" ],
    // dont move comma to new line
    "comma-dangle": [ "error", "never" ],
    // use unix linebreaks
    "linebreak-style": [ "error", "unix" ],
    // add a space before and after brackets
    "array-bracket-spacing": [ "error", "always" ],
    // adds a space before and after curly braces
    "object-curly-spacing": [ "error", "always" ],
    // moves the dot before a function call to the next line
    "newline-per-chained-call": [ "error", { "ignoreChainWithDepth": 2 } ],
    // ensures that functions are defined before they are used
    "func-style": [ "error", "declaration", { "allowArrowFunctions": true } ],
    // new line for ternary operator
    "multiline-ternary": [ "error", "always" ],
    // new line for operators
    "operator-linebreak": [ "error", "none", { "overrides": { "?": "before", ":": "before", "||": "after", "&&": "after" } } ],
    // new line for function arguments
    "function-call-argument-newline": [ "error", "consistent" ]
  }
}
