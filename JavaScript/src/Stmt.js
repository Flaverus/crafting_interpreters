export const Block = (statements) => ({
  type: "Block",
  statements,
  accept: (visitor) => visitor.Block(statements),
});

export const Expression = (expression) => ({
  type: "Expression",
  expression,
  accept: (visitor) => visitor.Expression(expression),
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