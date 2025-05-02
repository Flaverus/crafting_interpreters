import { createLoxCallable } from './LoxCallable.js';
import createEnvironment from './Environment.js';

const createLoxFunction = (name, params, body) => {

    console.log("========= LOX FUNCTION BODY LOG");
    console.log(body);
  return createLoxCallable(
    // arity function
    () => params.length,

    // call function
    (globals, executeBlock, args) => { // Different! Not getting Interpreter but globals and execute block!!!

      const environment = createEnvironment(globals);
      for (let i = 0; i < params.length; i++) {
        environment.define(params[i].lexeme, args[i]);
      }
          console.log(environment);

      try {
          console.log(environment);
        executeBlock(body, environment);
      } catch (returnValue) {
          console.log('CATCHHHHH!!!!!!');
        return returnValue.value;
      }
      return null;
    },

    // toString function
    () => `<fn ${name.lexeme}>`
  );
};

export default createLoxFunction;