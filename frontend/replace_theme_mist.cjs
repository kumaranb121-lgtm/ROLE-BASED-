const fs = require('fs');
const path = require('path');

const replacements = [
  // Primary Greens -> Mist Blue
  { regex: /#3A5F45/gi, replace: '#2f5061' },
  { regex: /#2C4C3B/gi, replace: '#223b47' },
  { regex: /#1C3022/gi, replace: '#16262e' },
  
  // Light Green Backgrounds -> Light Mist Blue / Grey
  { regex: /#F2F7F4/gi, replace: '#f4f7f8' },
  { regex: /#E6F0E9/gi, replace: '#e5ebed' },
  { regex: /#D8E6DC/gi, replace: '#d8e2e6' },

  // Tailwind class replacements
  { regex: /bg-green-/g, replace: 'bg-slate-' },
  { regex: /text-green-/g, replace: 'text-slate-' },
  { regex: /border-green-/g, replace: 'border-slate-' }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walkDir(path.join(__dirname, 'src'));

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(r => {
    newContent = newContent.replace(r.regex, r.replace);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nTheme replacement complete! Modified ${changedFiles} files.`);
