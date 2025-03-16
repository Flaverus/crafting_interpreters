import { Binary, Grouping, Literal, Unary } from './Expr.js';
import TokenType from './TokenType.js';
import { error as loxError } from './Lox.js';

// Factory function that creates a parser instance with functional style. Again slight naming difference
const createParser = tokens => {
  let current = 0; // Pointer to current token

  // Main parse function that attempts to parse an expression and returns an AST node.
  const parse = () => {
    try {
      return expression();
    } catch (e) {
      return null;
    }
  };

  // expression --> equality ;
  const expression = () => equality();

  // equality --> comparison ( ( "!=" | "==" ) comparison )* ;
  const equality = () => {
    let expr = comparison();

    while (match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = previous();
      const right = comparison();
      expr = Binary(expr, operator, right);
    }

    return expr;
  };

  // comparison --> term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
  const comparison = () => {
    let expr = term();

    while (match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = previous();
      const right = term();
      expr = Binary(expr, operator, right);
    }

    return expr;
  };

  // term --> factor ( ( "-" | "+" ) factor )* ;
  const term = () => {
    let expr = factor();

    while (match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = previous();
      const right = factor();
      expr = Binary(expr, operator, right);
    }

    return expr;
  };

  // factor --> unary ( ( "/" | "*" ) unary )* ;
  const factor = () => {
    let expr = unary();

    while (match(TokenType.SLASH, TokenType.STAR)) {
      const operator = previous();
      const right = unary();
      expr = Binary(expr, operator, right);
    }

    return expr;
  };

  // unary --> ( "!" | "-" ) unary | primary ;
  const unary = () => {
    if (match(TokenType.BANG, TokenType.MINUS)) {
      const operator = previous();
      const right = unary();
      return Unary(operator, right);
    }

    return primary();
  };

  // primary --> "false" | "true" | "nil" | NUMBER | STRING | "(" expression ")" ;
  const primary = () => {
    if (match(TokenType.FALSE)) return Literal(false);
    if (match(TokenType.TRUE)) return Literal(true);
    if (match(TokenType.NIL)) return Literal(null);

    if (match(TokenType.NUMBER, TokenType.STRING)) {
      return Literal(previous().literal);
    }

    if (match(TokenType.LEFT_PAREN)) {
      const expr = expression();
      consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return Grouping(expr);
    }

    // If no valid token was found for a primary expression, report an error.
    throw error(peek(), "Expect expression.");
  };

  // Checks if the current token matches any of the provided types.
  const match = (...types) => {
    for (let type of types) {
      if (check(type)) {
        advance();
        return true;
      }
    }

    return false;
  };

  // Consumes the current token if it matches the expected type.
  const consume = (type, message) => {
    if (check(type)) return advance();

    throw error(peek(), message);
  };

  const check = type => {
    if (isAtEnd()) return false;
    return peek().type === type;
  };

  const advance = () => {
    if (!isAtEnd()) current++;
    return previous();
  };

  // Checks if we've reached the end of the token list.
  const isAtEnd = () => peek().type === TokenType.EOF;

  // Returns the current token without advancing.
  const peek = () => tokens[current];

  // Returns the most recently consumed token.
  const previous = () => tokens[current - 1];

  // Reports a parse error using Lox's centralized error reporter.
  const error = (token, message) => {
    loxError(token, message);
    return new Error("ParseError");
  };

  // Synchronizes the parser after an error to resume at a likely statement boundary.
  // It discards tokens until it finds one that likely starts a new statement.
  const synchronize = () => {
    advance();

    while (!isAtEnd()) {
      if (previous().type === TokenType.SEMICOLON) return;

      switch (peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      advance();
    }
  };

  // Expose the main parse function and the synchronize method.
  return { parse, synchronize };
};

export default createParser;