import { Assign, Binary, Grouping, Literal, Logical, Unary, Variable } from './Expr.js';
import { Block, Expression, If, Print, Var, While } from './Stmt.js'
import TokenType from './TokenType.js';
import { error as loxError } from './Lox.js';

// Factory function that creates a parser instance with functional style. Again slight naming difference
const createParser = tokens => {
  let current = 0; // Pointer to current token

  // Main parse function
  const parse = () => {
    const statements = [];
    while (!isAtEnd()) {
      statements.push(declaration());
    }
    return statements;
  };

  // expression --> assignment ;
  const expression = () => assignment();

  // declaration --> varDecl | statement ;
  const declaration = () => {
    try {
      if (match(TokenType.VAR)) return varDeclaration();
      return statement();
    } catch (error) {
      synchronize();
      return null;
    }
  };

  // statement --> expressionStatement | forStatement | ifStatement | printStatement | whileStatement | block ;
  const statement = () => {
    if (match(TokenType.FOR)) return forStatement();
    if (match(TokenType.IF)) return ifStatement();
    if (match(TokenType.PRINT)) return printStatement();
    if (match(TokenType.WHILE)) return whileStatement();
    if (match(TokenType.LEFT_BRACE)) return Block(block());

    return expressionStatement();
  };

  // forStatement --> "for" "(" ( varDeclaration | expressionStatement | ";" ) expression? ";" expression? ")" statement ;
  const forStatement = () => {
    consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");

    let initializer;
    if (match(TokenType.SEMICOLON)) {
      initializer = null;
    } else if (match(TokenType.VAR)) {
      initializer = varDeclaration();
    } else {
      initializer = expressionStatement();
    }

    let condition = null;
    if (!check(TokenType.SEMICOLON)) {
      condition = expression();
    }
    consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

    let increment = null;
    if (!check(TokenType.RIGHT_PAREN)) {
      increment = expression();
    }
    consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

    let body = statement();

    //
    if (increment !== null) {
      body = Block([
        body,
        Expression(increment),
      ]);
    }

    if (condition === null) {
      condition = Literal(true);
    }
    body = While(condition, body);

    if (initializer !== null) {
      body = Block([initializer, body]);
    }
    //

    return body;
  };

  // ifStatement --> "if" "(" expression ")" statement ( "else" statement )? ;
  const ifStatement = () => {
    consume(TokenType.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition = expression();
    consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch = statement();
    let elseBranch = null;
    if (match(TokenType.ELSE)) {
      elseBranch = statement();
    }
  }

  // printStatement --> "print" expression ";" ;
  const printStatement = () => {
    const value = expression();
    consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return Print(value);
  };

  // varDeclaration --> "var" IDENTIFIER ( "=" expression )? ";" ;
  const varDeclaration = () => {
    const name = consume(TokenType.IDENTIFIER, "Expect variable name.");

    let initializer = null;
    if (match(TokenType.EQUAL)) {
      initializer = expression();
    }

    consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return Var(name, initializer);
  };

  // whileStatement --> "while" "(" expression ")" statement ;
  const whileStatement = () => {
    consume(TokenType.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition = expression();
    consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
    const body = statement();

    return While(condition, body);
  };

  // expressionStatement --> expression ";" ;
  const expressionStatement = () => {
    const expr = expression();
    consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return Expression(expr);
  };

  // block --> "{" declaration* "}" ;
  const block = () => {
    const statements = [];
    while (!check(TokenType.RIGHT_BRACE) && !isAtEnd()) {
      statements.push(declaration());
    }

    consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
    return statements;
  };

  // assignment --> IDENTIFIER "=" assignment | logic_or ;
  const assignment = () => {
    let expr = or();

    if (match(TokenType.EQUAL)) {
      const equals = previous();
      const value = assignment(); // Recursive call for the right-hand side.

      if (expr.type === "Variable") {
        const name = expr.name;
        return Assign(name, value);
      }

      error(equals, "Invalid assignment target.");
    }

    return expr;
  };

  // logic_or --> logic_and ( "or" logic_and )* ;
  const or = () => {
    let expr = and();

    while (match(TokenType.OR)) {
      const operator = previous();
      const right = and();
      expr = Logical(expr, operator, right);
    }

    return expr;
  };

  // logic_and --> equality ( "and" equality )* ;
  const and = () => {
    let expr = equality();

    while (match(TokenType.AND)) {
      const operator = previous();
      const right = equality();
      expr = Logical(expr, operator, right);
    }

    return expr;
  };

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

  // primary --> "false" | "true" | "nil" | NUMBER | STRING | "(" expression ")" | IDENTIFIER ;
  const primary = () => {
    if (match(TokenType.FALSE)) return Literal(false);
    if (match(TokenType.TRUE)) return Literal(true);
    if (match(TokenType.NIL)) return Literal(null);

    if (match(TokenType.NUMBER, TokenType.STRING)) {
      return Literal(previous().literal);
    }

    if (match(TokenType.IDENTIFIER)) {
      return Variable(previous());
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