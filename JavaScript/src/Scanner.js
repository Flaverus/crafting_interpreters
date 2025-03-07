import TokenType from './TokenType.js';  // Import TokenType
import Token from './Token.js';          // Import Token

const keywords = Object.freeze({
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
});

const createScanner = source => {
  let start = 0;
  let current = 0;
  let line = 1;
  const tokens = [];

  const scanTokens = () => {
    while(!isAtEnd()) {
      start = current;
      scanToken();
    }

    // End the tokens list with an EOF token
    tokens.push(addToken(TokenType.EOF, '', null, line));
    return tokens;
  }

  // Tokenize the current character
  const scanToken = () => {
    const c = advance();
    switch (c) {
      case '(': addTokenWithTypeOnly(TokenType.LEFT_PAREN); break;
      case ')': addTokenWithTypeOnly(TokenType.RIGHT_PAREN); break;
      case '{': addTokenWithTypeOnly(TokenType.LEFT_BRACE); break;
      case '}': addTokenWithTypeOnly(TokenType.RIGHT_BRACE); break;
      case ',': addTokenWithTypeOnly(TokenType.COMMA); break;
      case '.': addTokenWithTypeOnly(TokenType.DOT); break;
      case '-': addTokenWithTypeOnly(TokenType.MINUS); break;
      case '+': addTokenWithTypeOnly(TokenType.PLUS); break;
      case ';': addTokenWithTypeOnly(TokenType.SEMICOLON); break;
      case '*': addTokenWithTypeOnly(TokenType.STAR); break;
      case '!': addTokenWithTypeOnly(match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
      case '=': addTokenWithTypeOnly(match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
      case '<': addTokenWithTypeOnly(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
      case '>': addTokenWithTypeOnly(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
      case '/': match('/') ? handleComment() : addTokenWithTypeOnly(TokenType.SLASH); break;

      case ' ': case '\r': case '\t': break; // Ignore whitespace
      case '\n': line++; break;
      case '"': string(); break;

      default:
        if (isDigit(c)) number();
        else if (isAlpha(c)) identifier();
        else Lox.error(line, 'Unexpected character.');
    }
  };

  // Helpers for token handling
  // Add token with type and optional literal
  const addToken = (type, literal = null) => {
    const text = source.substring(start, current);
    tokens.push(Token(type, text, literal, line));
  };

  // Overloaded version of addToken that calls the above method with a null literal
  const addTokenWithTypeOnly = (type) => {
    addToken(type, null);
  };

  const match = (expected) => {
    if (isAtEnd()) return false;
    if (source.charAt(current) !== expected) return false;
    current++;
    return true;
  };

  const advance = () => source.charAt(current++);
  const isAtEnd = () => current >= source.length;
  const peek = () => (isAtEnd() ? '\0' : source.charAt(current));
  const peekNext = () => (current + 1 >= source.length ? '\0' : source.charAt(current + 1));

  // Token-specific methods
  const string = () => {
    while (peek() !== '"' && !isAtEnd()) {
      if (peek() === '\n') line++;
      advance();
    }
    if (isAtEnd()) {
      Lox.error(line, 'Unterminated string.');
      return;
    }
    advance(); // closing "
    const value = source.substring(start + 1, current - 1);
    addToken(TokenType.STRING, value);
  };

  const number = () => {
    while (isDigit(peek())) advance();
    if (peek() === '.' && isDigit(peekNext())) {

      advance();
      while (isDigit(peek())) advance();
    }
    addToken(TokenType.NUMBER, parseFloat(source.substring(start, current)));
  };

  const identifier = () => {
    while (isAlphaNumeric(peek())) advance();
    const text = source.substring(start, current);
    const type = keywords[text] || TokenType.IDENTIFIER;
    addToken(type);
  };

  // Comment handling
  const handleComment = () => {
    while (peek() !== '\n' && !isAtEnd()) advance();
  };

  // Character check helpers
  const isDigit = (c) => c >= '0' && c <= '9';
  const isAlpha = (c) => /[a-zA-Z_]/.test(c);
  const isAlphaNumeric = (c) => isAlpha(c) || isDigit(c);

  return { scanTokens };
};

export default createScanner;