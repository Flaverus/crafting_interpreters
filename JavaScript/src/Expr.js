// In JS we use factory functions that return plain objects instead of classes.

export const Binary = (left, operator, right) => ({
  // JS: Instead of inheritance, we use an object with a `type` field for pattern matching.
  type: "Binary",
  left,
  operator,
  right,
  accept: (visitor) => visitor.Binary(left, operator, right),   // We use a function that directly calls the appropriate visitor method.
});

export const Grouping = (expression) => ({
  type: "Grouping",
  expression,
  accept: (visitor) => visitor.Grouping(expression),
});

export const Literal = (value) => ({
  type: "Literal",
  value,
  accept: (visitor) => visitor.Literal(value),
});

export const Unary = (operator, right) => ({
  type: "Unary",
  operator,
  right,
  accept: (visitor) => visitor.Unary(operator, right),
});