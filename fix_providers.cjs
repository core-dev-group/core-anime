const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'app', 'lib', 'providers');
const files = fs.readdirSync(libDir).filter(f => f.endsWith('.ts') && f !== 'base.ts' && f !== 'utils.ts' && f !== 'registry.ts');

const replaceLogic = `
    let list: any = data?.data || data?.home || data?.ongoing || data?.latest || data?.search || data || [];
    if (!Array.isArray(list)) {
      if (list.animeList && Array.isArray(list.animeList)) {
        list = list.animeList;
      } else if (list.ongoing && list.ongoing.animeList && Array.isArray(list.ongoing.animeList)) {
        list = list.ongoing.animeList;
      } else if (list.data && Array.isArray(list.data)) {
        list = list.data;
      } else {
        const arrValue = Object.values(list).find(v => Array.isArray(v));
        if (arrValue) {
          list = arrValue;
        } else {
          const arrAnimeList = Object.values(list).find(v => v && typeof v === 'object' && Array.isArray((v as any).animeList));
          if (arrAnimeList) list = (arrAnimeList as any).animeList;
          else list = [];
        }
      }
    }
`;

files.forEach(f => {
  const filePath = path.join(libDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace anything starting from `let list: any = ` up to the return list.map
  const blockRegex = /let list: any = data\?.data.*?\}\s*\n\s*\}\s*\n\s*return list\.map/gs;
  
  content = content.replace(blockRegex, replaceLogic.trim() + '\n\n    return list.map');

  fs.writeFileSync(filePath, content);
});
console.log("Syntax errors fixed");
