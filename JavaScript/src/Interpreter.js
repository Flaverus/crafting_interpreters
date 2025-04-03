import TokenType from './TokenType.js';
import RuntimeError from './RuntimeError.js';
import { runtimeError } from './Lox.js'

// Interpreter factory function
const createInterpreter = () => {
  // Taking an AST expression and evaluating it
  const interpret = (expr) => {
    try {
      const value = evaluate(expr);
      console.log(stringify(value));
    } catch (error){
      runtimeError(error.token, error.message);
    }

  };

  // Instead of overriding methods, we simply have an object that acts as a map of functions.
  // A property per type that handles the accept() call from the Expression
  const interpreter = {
    Binary: (left, operator, right) => {
      const leftValue = evaluate(left);
      const rightValue = evaluate(right);

      switch (operator.type) {
        case TokenType.GREATER:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue > rightValue;
        case TokenType.GREATER_EQUAL:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue >= rightValue;
        case TokenType.LESS:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue < rightValue;
        case TokenType.LESS_EQUAL:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue <= rightValue;
        case TokenType.MINUS:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue - rightValue;
        case TokenType.PLUS:
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            return leftValue + rightValue;  // Handle numeric addition
          }

          if (typeof leftValue === "string" && typeof rightValue === "string") {
            return leftValue + rightValue;  // Handle string concatenation
          }
          // We differ here, even though it makes no difference for JS to implement this rule to Lox
          throw new RuntimeError(operator, "Operands must be two numbers or two strings.");
        case TokenType.SLASH:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue / rightValue;
        case TokenType.STAR:
          checkNumberOperands(operator, leftValue, rightValue);
          return leftValue * rightValue;
        case TokenType.BANG_EQUAL:
          return leftValue !== rightValue;
        case TokenType.EQUAL_EQUAL:
          return leftValue === rightValue;
      }
    },

    Grouping: (expression) => evaluate(expression),

    Literal: (value) => value,

    Unary: (operator, right) => {
      const rightValue = evaluate(right);

      switch (operator.type) {
        case TokenType.BANG:
          return !rightValue;
        case TokenType.MINUS:
          checkNumberOperand(operator, rightValue);
          return -rightValue;
      }
    },
  };

  // Helper function to evaluate expressions
  const evaluate = (expr) => {
    return expr.accept(interpreter); // Giving interpreter Object to the accept function of the passed expression, resulting in the accept function from the visitor (interpreter Object) being called
  };

  const isTruthy = (object) => {
    if (object === null) return false;  // null is falsy
    if (typeof object === 'boolean') return object;  // Only explicitly false values are falsy
    return true;  // All other values are truthy
  };

  const isEqual = (a, b) => {
    if (a === null && b === null) return true;  // Both are null
    if (a === null || b === null) return false;  // One is null, the other is not
    return a === b;  // Strict equality check
  };

  const checkNumberOperand = (operator, operand) => {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  };

  const checkNumberOperands = (operator, left, right) => {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be two numbers.");
  };

  const stringify = (object) => {
    if (object === null) {
      return "nil";  // Handle null as "nil"
    }

    if (typeof object === 'number') {
      // If the number has a decimal part but is effectively an integer, remove the ".0"
      const text = object.toString();
      if (text.endsWith('.0')) {
        return text.substring(0, text.length - 2);
      }
      return text;  // Return the number as is if no decimal part
    }

    return object.toString();  // Default case, convert to string
  };

  return { interpret };
};

export default createInterpreter;