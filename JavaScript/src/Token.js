const Token = (type, lexeme, literal, line) => ({
  type,
  lexeme,
  literal,
  line,

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
});

export default Token;