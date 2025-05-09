import { createLoxCallable } from './LoxCallable.js';
import createLoxInstance from './LoxInstance.js';

const createLoxClass = (name) => {
  return createLoxCallable(
    // arity function
    () => 0,

    // call function
    () => {
      const instance = createLoxInstance(name);
      return instance;
    },

    // toString function
    () => name
  );
}

export default createLoxClass;
