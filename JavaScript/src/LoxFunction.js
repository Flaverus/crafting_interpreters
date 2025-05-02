import { createLoxCallable } from './LoxCallable.js';
import createEnvironment from './Environment.js';

const createLoxFunction = (name, params, body) => {
  return createLoxCallable(
    // arity function
    () => params.length,

    // call function
    (globals, executeBlock, args) => { // Different! Not getting Interpreter but globals and execute block!!!

      const environment = createEnvironment(globals);
      for (let i = 0; i < params.length; i++) {
        environment.define(params[i].lexeme, args[i]);
      }

      executeBlock(body, environment);
      return null;
    },

    // toString function
    () => `<fn ${name.lexeme}>`
  );
};

export default createLoxFunction;