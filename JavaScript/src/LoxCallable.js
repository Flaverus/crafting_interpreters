import createEnvironment from './Environment.js';

//Again Factory function returning an object
export const createLoxCallable = (arity, call, toString) => ({
  arity,
  call,
  toString,
});