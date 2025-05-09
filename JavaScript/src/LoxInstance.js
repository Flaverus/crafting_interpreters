import RuntimeError from './RuntimeError.js';

const createLoxInstance = (name, findMethod) => {
  const fields = new Map();
  return {
    name,
    get: (nameToken) => {
      if (fields.has(nameToken.lexeme)) {
        return fields.get(nameToken.lexeme);
      }

      const method = findMethod(nameToken.lexeme);
      if (method !== null) return method;

      throw new RuntimeError(nameToken, `Undefined property '${nameToken.lexeme}'.`);
    },
    set: (nameToken, value) => {
      fields.set(nameToken.lexeme, value);
    },
    toString: () => name + " instance"
  };
}

export default createLoxInstance;
