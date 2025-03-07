import fs from 'fs'; // get file system
import readline from 'readline';
import createScanner from './Scanner.js';
let hadError = false;

const main = () => {
  const [path] = process.argv.slice(2);

  if (path) {
    // If there is a file path, run it
    runFile(path);
  } else {
    // If no file, start the prompt for interactive input
    runPrompt();
  }
}

const run = source => {
  const scanner = createScanner(source);
  const tokens = scanner.scanTokens();

  tokens.forEach(token => console.log(token)); // Log each token for now
}

const runFile = path => {
  try {
    const source = fs.readFileSync(path, 'utf-8');
    run(source);

    if (hadError) process.exit(65);
  } catch (err) {
    console.error("Error reading file:", err);
  }
};

const runPrompt = () => {
  const rl = readline.createInterface({
    input: process.stdin, // User input
    output: process.stdout // Console output
  });

  rl.on('line', (line) => {
    if (line) {
      run(line);
      hadError = false;
    }
  });
};

const error = (line, message) => {
  report(line, '', message);
};

const report = (line, where, message) => {
  console.error(`[line ${line}] Error${where}: ${message}`);
  hadError = true;
};

main();