import { error as loxError } from './Lox.js';

const createResolver = (interpreter) => {
  const scopes = []; // Using array as a stack
  let currentFunction = 'NONE'; //@TODO create pseudo "ENUM" --> NONE, FUNCTION, METHOD
  let currentClass = 'CLASS' // --> also add ClassType ENUM!

  const beginScope = () => {
    scopes.push(new Map());
  };

  const endScope = () => {
    scopes.pop();
  };

  const declare = (name) => {
    if (scopes.length === 0) return;
    const scope = scopes.at(-1); // .at(-1) gets last element

    if (scope.has(name.lexeme)) {
      loxError(name, "Already a variable with this name in this scope.");
    }
    scope.set(name.lexeme, false);
  };

  const define = (name) => {
    if (scopes.length === 0) return;
    scopes.at(-1).set(name.lexeme, true);
  };

  const resolveLocal = (nodeId, name) => {
    for (let i = scopes.length - 1; i >= 0; i--) {
      const scope = scopes[i];
      if (scope.has(name.lexeme)) {
        interpreter.resolve(nodeId, scopes.length - 1 - i);
        return;
      }
    }
  };

  const resolveFunction = (func, type) => {
    const enclosingFunction = currentFunction;
    currentFunction = type;
    beginScope();
    for (const param of func.params) {
      declare(param);
      define(param);
    }
    resolve(func.body);
    endScope();
    currentFunction = enclosingFunction;
  };

  const resolve = (stmtOrExpr) => {
    if (Array.isArray(stmtOrExpr)) {
      for (const item of stmtOrExpr) {
        item.accept(resolver);
      }
    } else {
      stmtOrExpr.accept(resolver);
    }
  };

  const resolver = {
    Block: (statements) => {
      beginScope();
      for (const statement of statements) {
        resolve(statement);
      }
      endScope();
    },

    Class: (name, methods) => {
      const enclosingClass = currentClass; // @TODO: Change ENUM!

      declare(name);
      define(name);

      beginScope();
      scopes.at(-1).set("this", true);

      for (const method of methods) {
        let declaration = 'METHOD';
        if (method.name.lexeme === ("init")) {
          declaration = 'INITIALIZER';
        }
        resolveFunction(method, declaration);
      }

      endScope();

      currentClass = enclosingClass;
    },

    Expression: (expression) => {
      resolve(expression);
    },

    Function: (name, params, body) => {
      declare(name);
      define(name);
      resolveFunction({ params, body }, "FUNCTION"); // Creating a temp object
    },

    If: (condition, thenBranch, elseBranch) => {
      resolve(condition);
      resolve(thenBranch);
      if (elseBranch) resolve(elseBranch);
    },

    Print: (expression) => {
      resolve(expression);
    },

    Return: (keyword, value) => {
      if (currentFunction === "NONE") {
        loxError(keyword, "Can't return from top-level code.");
      }
      if (value) {
        if(currentFunction === "INITIALIZER") {
          loxError(keyword, "Can't return a value from an initializer.");
        }
        resolve(value);
      }
    },

    Var: (name, initializer) => {
      declare(name);
      if (initializer) resolve(initializer);
      define(name);
    },

    While: (condition, body) => {
      resolve(condition);
      resolve(body);
    },

    Assign: (name, value, nodeId) => {
      resolve(value);
      resolveLocal(nodeId, name); // Assuming a basic Variable node
    },

    Binary: (left, operator, right) => {
      resolve(left);
      resolve(right);
    },

    Call: (callee, paren, args) => {
      resolve(callee);
      for (const arg of args) {
        resolve(arg);
      }
    },

    Get: (object, name) => {
      resolve(object);
    },

    Grouping: (expression) => {
      resolve(expression);
    },

    Literal: (value) => {
      // No resolution needed for literals
    },

    Logical: (left, operator, right) => {
      resolve(left);
      resolve(right);
    },

    Set: (object, name, value) => {
      resolve(value);
      resolve(object);
    },

    This: (keyword, nodeId) => {
      if(currentClass === 'NONE') {
        loxError(keyword, "Can't use 'this' outside of a class.");
      }
      resolveLocal(nodeId, keyword);
    },

    Unary: (operator, right) => {
      resolve(right);
    },

    Variable: (name, nodeId) => {
      if (scopes.length > 0 && scopes.at(-1).get(name.lexeme) === false) {
        loxError(name, "Can't read local variable in its own initializer.");
      }
      resolveLocal(nodeId, name); // Assuming a basic Variable node
    },
  };

  return { resolve, resolver };
};

export default createResolver;