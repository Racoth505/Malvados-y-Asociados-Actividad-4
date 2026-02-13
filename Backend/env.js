const fs = require('fs');
const path = require('path');

function parseAndAssign(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  const rootDir = path.resolve(__dirname, '..');
  const isProduction = process.env.NODE_ENV === 'production';

  const selectedFile = isProduction ? '.env.production' : '.env';
  const selectedPath = path.join(rootDir, selectedFile);
  parseAndAssign(selectedPath);

  if (isProduction && !fs.existsSync(selectedPath)) {
    parseAndAssign(path.join(rootDir, '.env'));
  }
}

loadEnv();

