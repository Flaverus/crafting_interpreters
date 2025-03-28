import fs from 'fs'; // get file system
import readline from 'readline';
import createScanner from './Scanner.js';
import createParser from './Parser.js';
import createInterpreter from './Interpreter.js';
import AstPrinter from './AstPrinter.js';
import TokenType from './TokenType.js';

let hadError = false;
let hadRuntimeError = false;

// node src/lox.js to start

const main = () => {
  const [path] = process.argv.slice(2); // Get path if provided

  if (path) {
    // If there is a file path, run it
    runFile(path);
  } else {
    // If no file, start the prompt for interactive input
    runPrompt();
  }
}

const runFile = path => {
  try {
    const source = fs.readFileSync(path, 'utf-8'); // Read string directly
    run(source);

    if (hadError) process.exit(65);
    if (hadRuntimeError) process.exit(70);
  } catch (err) {
    console.error("Error reading file:", err);
  }
};

const runPrompt = () => {
  const rl = readline.createInterface({
    input: process.stdin, // User input
    output: null // Console output
  });

  rl.on('line', (line) => {
    if (line) {
      run(line);
      hadError = false;
    }
  });
};

const run = source => {
  const scanner = createScanner(source);
  const tokens = scanner.scanTokens();

  // Create the parser in a functional style (using a factory function).
  const parser = createParser(tokens);
  const expression = parser.parse();

  // If a syntax error occurred during parsing, stop before printing.
  if (hadError) return;

  const interpreter = createInterpreter();
  interpreter.interpret(expression);
};

// A functional variant of the Java static error(Token, String) method.
// It accepts either a token object (with a lexeme property) or a line number.
// If a token is provided and it's the EOF token, we report the error "at end".
// Otherwise, we report the error using the token's lexeme.
const error = (tokenOrLine, message) => {
  if (typeof tokenOrLine === 'object' && tokenOrLine.lexeme !== undefined) {
    // Token error handling.
    if (tokenOrLine.type === TokenType.EOF) {
      report(tokenOrLine.line, " at end", message);
    } else {
      report(tokenOrLine.line, ` at '${tokenOrLine.lexeme}'`, message);
    }
  } else {
    // If not a token, treat the argument as a line number.
    report(tokenOrLine, '', message);
  }
};

const runtimeError = (token, message) => {
  console.error(`${message}\n[line: ${token.line}]`);
  hadRuntimeError = true;
}

const report = (line, where, message) => {
  console.error(`[line ${line}] Error${where}: ${message}`);
  hadError = true;
};

main();

export { error, runtimeError };