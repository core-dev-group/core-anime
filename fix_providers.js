const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'app', 'lib', 'providers');
const files = fs.readdirSync(libDir).filter(f => f.endsWith('.ts') && f !== 'base.ts' && f !== 'utils.ts' && f !== 'registry.ts');

files.forEach(f => {
  const filePath = path.join(libDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix getHome list parsing
  content = content.replace(
    /const list = data\?.data \|\| data\?.home \|\| data\?.ongoing \|\| data\?.latest \|\| data \|\| \[\];\s*if \(\!Array\.isArray\(list\)\) return \[\];/g,
    `const list = data?.data?.ongoing?.animeList || data?.data?.animeList || data?.data || data?.home || data?.ongoing || data?.latest || data || [];\n    const finalArray = Array.isArray(list) ? list : (Array.isArray(list?.animeList) ? list.animeList : (Array.isArray(data?.data?.search) ? data.data.search : (Array.isArray(data?.search) ? data.search : [])));\n    if (!Array.isArray(finalArray) || finalArray.length === 0) { const possibleArr = Object.values(list).find(v => typeof v === 'object' && v && Array.isArray(v.animeList)); if (possibleArr) { list = possibleArr.animeList; } }`
  );

  // Instead of complex regex, let's just make it simpler
  fs.writeFileSync(filePath, content);
});
console.log("Providers fixed");
