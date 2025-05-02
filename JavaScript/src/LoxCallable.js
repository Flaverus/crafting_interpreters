import createEnvironment from './Environment.js';

export const createLoxCallable = (arity, call, toString) => ({
  arity,
  call,
  toString,
});