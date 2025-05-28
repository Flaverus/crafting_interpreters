import { Binary, Grouping, Literal, Unary } from "./Expr.js";
import TokenType from './TokenType.js';
import Token from './Token.js';

// Instead of defining a class with methods, we use an object with functions.
const AstPrinter = {
  print: (expr) => expr.accept(AstPrinter),

  // Each function here handles a different expression type.
  Binary: (left, operator, right) =>
    parenthesize(operator.lexeme, left, right),

  Grouping: (expression) =>
    parenthesize("group", expression),

  Literal: (value) =>
    value === null ? "nil" : value.toString(),

  Unary: (operator, right) =>
    parenthesize(operator.lexeme, right),
};

const parenthesize = (name, ...exprs) => {
  // Start the string with the operator or function name
  return `(${name} ${exprs.map((expr) => expr.accept(AstPrinter)).join(" ")})`;
};

const exampleExpr = Binary(
  Unary(
    Token(TokenType.MINUS, "-", null, 1),
    Literal(123)
  ),
  Token(TokenType.STAR, "*", null, 1),
  Grouping(Literal(45.67))
);


export default AstPrinter;
