import { createLoxCallable } from './LoxCallable.js';
import createEnvironment from './Environment.js';

const createLoxFunction = (name, params, body, closure, isInitializer) => {

  const bind = (instance) => {
    const environment = createEnvironment(closure);
    environment.define("this", instance);
    return createLoxFunction(name, params, body, environment, isInitializer);
  }

  const callable = createLoxCallable(
    // arity function
    () => params.length,

    // call function
    (executeBlock, args) => { // Different! Not getting Interpreter but globals and execute block!!!

      const environment = createEnvironment(closure);
      for (let i = 0; i < params.length; i++) {
        environment.define(params[i].lexeme, args[i]);
      }

      try {
        executeBlock(body, environment);
      } catch (returnValue) {
        if (isInitializer) return closure.getAt(0, "this");
        return returnValue.value;
      }

      if (isInitializer) return closure.getAt(0, "this");
      return null;
    },

    // toString function
    () => `<fn ${name.lexeme}>`
  );

    return {
      ...callable,
      bind,
    };
};

export default createLoxFunction;