const createLoxClass = (name) => {
  return {
    name,
    toString: () => name
  };
}

export default createLoxClass;
