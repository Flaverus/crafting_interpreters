import { createLoxCallable } from './LoxCallable.js';
import createLoxInstance from './LoxInstance.js';

const createLoxClass = (name, methods) => {

  const findMethod = (methodName) => {
    if(methods.has(methodName)) {
      return methods.get(methodName);
    }
    return null;
  }

  return createLoxCallable(
    // arity function
    () => 0,

    // call function
    () => {
      const instance = createLoxInstance(name, findMethod);
      return instance;
    },

    // toString function
    () => name
  );
}

export default createLoxClass;
