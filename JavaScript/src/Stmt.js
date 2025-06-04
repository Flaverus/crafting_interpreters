// Basically the same as Expr:
// In JS we use factory functions that return plain objects instead of classes.
// We send the values separately to the visitor. We could have created an object and then return this. But I decided to handle values separately. No particular reason.
// nodeId was later added as well as we have no object reference for locals in Interpreter/Parser/Resolver

export const Block = (statements) => ({
  type: "Block",
  statements,
  accept: (visitor) => visitor.Block(statements),
});

export const Class = (name, superclass, methods) => ({
  type: "Class",
  name,
  superclass,
  methods,
  accept: (visitor) => visitor.Class(name, superclass, methods),
});

export const Expression = (expression) => ({
  type: "Expression",
  expression,
  accept: (visitor) => visitor.Expression(expression),
});

export const Function = (name, params, body) => ({
  type: "Function",
  name,
  params,
  body,
  accept: (visitor) => visitor.Function(name, params, body),
});

export const If = (condition, thenBranch, elseBranch) => ({
  type: "If",
  condition,
  thenBranch,
  elseBranch,
  accept: (visitor) => visitor.If(condition, thenBranch, elseBranch),
});

export const Print = (expression) => ({
  type: "Print",
  expression,
  accept: (visitor) => visitor.Print(expression),
});

export const Return = (keyword, value) => ({
  type: "Return",
  keyword,
  value,
  accept: (visitor) => visitor.Return(keyword, value),
});

export const Var = (name, initializer) => ({
  type: "Var",
  name,
  initializer,
  accept: (visitor) => visitor.Var(name, initializer),
});

export const While = (condition, body) => ({
  type: "While",
  condition,
  body,
  accept: (visitor) => visitor.While(condition, body),
});