import TokenType from './TokenType.js';
import { createLoxCallable } from './LoxCallable.js';
import createLoxFunction from './LoxFunction.js'
import createLoxClass from './LoxClass.js';
import createEnvironment from './Environment.js';
import RuntimeError from './RuntimeError.js';
import Return from './Return.js';
import { runtimeError } from './Lox.js'

// Interpreter factory function
const createInterpreter = () => {

  const globals = createEnvironment();
  const locals = new Map();
  let environment = globals;

  // Define the 'clock' native function in the globals environment using LoxCallable
  globals.define("clock", createLoxCallable(
    0,  // Arity: clock takes 0 arguments
    (interpreter, args) => {
      return Date.now() / 1000;  // Return time in seconds
    },
    () => "<native fn>",  // String representation of the function
  ));


  // Interpret the list of statements (not just a single expression)
  const interpret = (statements) => {
    try {
      for (let stmt of statements) {
        execute(stmt);
      }
    } catch (error) {
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

    Call: (cle, paren, args) => {
      const callee = evaluate(cle);

      const argVals = args.map(arg => evaluate(arg));

      if (typeof callee.call !== 'function') {
        throw new RuntimeError(paren, "Can only call functions and classes.");
      }

      if (typeof callee.arity === 'function' && argVals.length !== callee.arity()) {
        throw new RuntimeError(paren, `Expected ${callee.arity()} arguments but got ${argVals.length}.`);
      }

      return callee.call(executeBlock, argVals); // Different as I can not send this..?
    },

    Get: (obj, name) => {
      const object = evaluate(obj);

      if (object && typeof object.get === 'function') {
        return object.get(name);
      }

      throw new RuntimeError(name, "Only instances have properties.");
    },

    Grouping: (expression) => evaluate(expression),

    Literal: (value) => value,

    Logical: (lft, operator, right) => {
      const left = evaluate(lft);

      if (operator.type === TokenType.OR) {
        if (isTruthy(left)) return left;
      } else {
        if (!isTruthy(left)) return left;
      }

      return evaluate(right);
    },

    Set: (obj, name, val) => {
      const object = evaluate(obj);

      if (!object || typeof object.set !== 'function') {
        throw new RuntimeError(nameToken, "Only instances have fields.");
      }

      const value = evaluate(val);
      object.set(name, value);
      return value;
    },

    Super: (keyword, mthd, nodeId) => {
      const distance = locals.get(nodeId);
      const superclass = environment.getAt(distance, "super");
      const object = environment.getAt(distance - 1, "this");

      const method = superclass.findMethod(mthd.lexeme);

      if (method === null) {
        throw new RuntimeError(method, "Undefined property '" + mthd.lexeme + "'.");
      }

      return method.bind(object);
    },

    This: (keyword, nodeId) => {
      return lookUpVariable(keyword, nodeId);
    },

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

    Variable: (name, nodeId) => {
      return lookUpVariable(name, nodeId);
    },

    Block: (statements) => {
      executeBlock(statements, createEnvironment(environment));
      return null;
    },

    Class: (name, sprclass, meths) => {
      let superclass = null;
      if (sprclass !== null) {
        superclass = evaluate(sprclass);
        if (!superclass || typeof superclass.findMethod !== "function") {
          throw new RuntimeError(sprclass.name, "Superclass must be a class.");
        }
      }

      environment.define(name.lexeme, null);

      if (sprclass !== null) {
        environment = createEnvironment(environment);
        environment.define("super", superclass);
      }

      const methods = new Map();
      for (const method of meths) {
        const func = createLoxFunction(method.name, method.params, method.body, environment, method.name.lexeme === 'init');
        methods.set(method.name.lexeme, func);
      }

      const klass = createLoxClass(name.lexeme, superclass, methods);

      if (superclass !== null) {
        environment = environment.enclosing;
      }

      environment.assign(name, klass);
    },

    Expression: (expression) => {
      evaluate(expression);
      return null;
    },

    Function: (name, params, body) => {
      const func = createLoxFunction(name, params, body, environment, false);
      environment.define(name.lexeme, func);
      return null;
    },

    If: (condition, thenBranch, elseBranch) => {
      if (isTruthy(evaluate(condition))) {
        execute(thenBranch);
      } else if (elseBranch !== null) {
        execute(elseBranch);
      }
      return null;
    },

    Print: (expression) => {
      const value = evaluate(expression);

      console.log(stringify(value));
      return null;
    },

    Return: (keyword, val) => {
      let value = null;

      if(val !== null) value = evaluate(val);

      throw new Return(value);
    },

    Var: (name, initializer) => {
      let value = null;
      if(initializer !== null) {
        value = evaluate(initializer);
      }

      environment.define(name.lexeme, value);
      return null;
    },

    While: (condition, body) => {
      while (isTruthy(evaluate(condition))) {
        execute(body);
      }
      return null;
    },

    Assign: (name, val, nodeId) => {
      const value = evaluate(val);

      const distance = locals.get(nodeId);
      if (distance !== undefined) {
        environment.assignAt(name, distance, value);
      } else {
        globals.assign(name, value);
      }

      return value;
    }
  };

  // Helper function to evaluate expressions
  const evaluate = expr => {
    return expr.accept(interpreter); // Giving interpreter Object to the accept function of the passed expression, resulting in the accept function from the visitor (interpreter Object) being called
  };

  const resolve = (_uniqueId, depth) => {
    locals.set(_uniqueId, depth);
  };

  const lookUpVariable = (name, nodeId) => {
    const distance = locals.get(nodeId);
    if (distance !== undefined) {
      return environment.getAt(distance, name.lexeme);
    } else {
      return globals.get(name);
    }
  };

  const executeBlock = (statements, env) => {
    const previous = environment;

    try {
      // Set the current environment to the provided one
      environment = env;

      for (const statement of statements) {
        execute(statement);
      }
    } finally {
      // Restore the previous environment after execution
      environment = previous;
    }
  };

  const execute = stmt => {
    stmt.accept(interpreter);
  }

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

  return { interpret, globals, executeBlock, resolve };
};

export default createInterpreter;