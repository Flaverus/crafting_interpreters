import RuntimeError from './RuntimeError.js';

const createEnvironment = (enclosing = null) => {
  const values = new Map();

  const get = (name) => {
    if (values.has(name.lexeme)) {
      return values.get(name.lexeme);
    }

    if (enclosing) return enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  };

  const define = (name, value) => {
    values.set(name, value);
  };

  const assign = (name, value) => {
    if (values.has(name.lexeme)) {
      values.set(name.lexeme, value);
      return;
    }

    if (enclosing) {
      enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
  };

  return { get, define, assign };
};

export default createEnvironment;