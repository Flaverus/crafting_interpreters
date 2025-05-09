const createLoxInstance = (name) => {
  return {
    name,
    toString: () => name + " instance"
  };
}

export default createLoxInstance;
