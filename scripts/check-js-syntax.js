import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const foldersToCheck = ['scripts', 'src', 'test'];
const filesToCheck = [];

function collectJavaScriptFiles(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);

    if (entry.isDirectory()) {
      collectJavaScriptFiles(path);
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      filesToCheck.push(path);
    }
  }
}

foldersToCheck.forEach(collectJavaScriptFiles);

for (const file of filesToCheck) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status);
  }
}

console.log(`Checked ${filesToCheck.length} JavaScript files.`);
