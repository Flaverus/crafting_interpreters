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

  const ancestor = (distance) => {
    let environment = thisEnv;
    for (let i = 0; i < distance; i++) {
      if (!environment.enclosing) {
        throw new RuntimeError(null, "Attempted to access variable from out of scope.");
      }
      environment = environment.enclosing;
    }
    return environment;
  };

    const getAt = (name, distance) => {
      return ancestor(distance).values.get(name.lexeme);
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

  const assignAt = (name, distance, value) => {
    ancestor(distance).values.set(name.lexeme, value);
  };

  const thisEnv = {
    enclosing,
    values,
    get,
    getAt,
    define,
    assign,
    ancestor,
    assignAt
  };

  return thisEnv;
};

export default createEnvironment;