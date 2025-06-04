import RuntimeError from './RuntimeError.js';

//Repeatedly working with a factory function and "create".
//Also getting the findMethod function as argument instead of getting class as we worked with values
const createLoxInstance = (name, findMethod) => {
  const fields = new Map();
  const instance = {
    name,
    get: (nameToken) => {
      if (fields.has(nameToken.lexeme)) {
        return fields.get(nameToken.lexeme);
      }

      const method = findMethod(nameToken.lexeme);
      if (method !== null) return method.bind(instance);

      throw new RuntimeError(nameToken, `Undefined property '${nameToken.lexeme}'.`);
    },
    set: (nameToken, value) => {
      fields.set(nameToken.lexeme, value);
    },
    toString: () => name + " instance"
  };

  return instance;
}

export default createLoxInstance;
