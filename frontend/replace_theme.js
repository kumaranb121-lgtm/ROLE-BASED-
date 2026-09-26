import fs from 'fs';
import path from 'path';

const directory = './src';

const replacements = [
  { search: /#4A1115/ig, replace: '#2C4C3B' },
  { search: /#7B1D23/ig, replace: '#3A5F45' },
  { search: /#632220/ig, replace: '#233B2B' },
  { search: /#5A1218/ig, replace: '#1C3022' },
  { search: /#FAF6F3/ig, replace: '#F2F7F4' },
  { search: /#F2EAE5/ig, replace: '#E6F0E9' },
  { search: /#EAE0D9/ig, replace: '#D8E6DC' },
  { search: /bg-red-(100|200|500|600|700)/g, replace: 'bg-green-$1' },
  { search: /text-red-(100|200|500|600|700)/g, replace: 'text-green-$1' },
  { search: /border-red-(100|200|500|600|700)/g, replace: 'border-green-$1' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const rule of replacements) {
        content = content.replace(rule.search, rule.replace);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(directory);
console.log('Color replacement complete.');
