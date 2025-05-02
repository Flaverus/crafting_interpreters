// In JS we use factory functions that return plain objects instead of classes.

export const Assign = (name, value) => ({
  type: "Assign",
  name,
  value,
  accept: (visitor) => visitor.Assign(name, value)
})

export const Binary = (left, operator, right) => ({
  // Instead of inheritance, we use an object with a `type` field for pattern matching.
  type: "Binary",
  left,
  operator,
  right,
  accept: (visitor) => visitor.Binary(left, operator, right),   // We use a function that directly calls the appropriate visitor method.
});

export const Call = (callee, paren, args) => ({
  type: "Call",
  callee,
  paren,
  args,
  accept: (visitor) => visitor.Call(callee, paren, args),
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

export const Logical = (left, operator, right) => ({
  type: "Logical",
  left,
  operator,
  right,
  accept: (visitor) => visitor.Logical(left, operator, right),
});

export const Unary = (operator, right) => ({
  type: "Unary",
  operator,
  right,
  accept: (visitor) => visitor.Unary(operator, right),
});

export const Variable = (name) => ({
  type: "Variable",
  name,
  accept: (visitor) => visitor.Variable(name),
});