// Token as factory function as I wanted to make it more functional and JS like instead of using a class

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