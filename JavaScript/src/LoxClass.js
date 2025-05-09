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
}

export default createLoxClass;
