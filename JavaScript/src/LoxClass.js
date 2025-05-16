import { createLoxCallable } from './LoxCallable.js';
import createLoxInstance from './LoxInstance.js';

const createLoxClass = (name, superclass, methods) => {

  const findMethod = (methodName) => {
    if(methods.has(methodName)) {
      return methods.get(methodName);
    }

    if (superclass !== null) {
      return superclass.findMethod(methodName);
    }

    return null;
  }

  const loxCallable = createLoxCallable(
    // arity function
    () => {
      const initializer = findMethod("init");
      if (initializer === null) return 0;
      return initializer.arity();
    },

    // call function
    (interpreter, args) => {
      const instance = createLoxInstance(name, findMethod);
      const initializer = findMethod('init');
      if (initializer !== null) {
        initializer.bind(instance).call(interpreter, args);
      }
      return instance;
    },

    // toString function
    () => name
  );

  return {
    ...loxCallable,
    findMethod
  };
}

export default createLoxClass;
