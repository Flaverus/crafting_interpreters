class RuntimeError extends Error {
  constructor(token, message) {
    super(message);
    this.token = token;  // Store the token associated with the error
  }
}

export default RuntimeError;