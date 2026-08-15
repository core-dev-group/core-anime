import * as cheerio from 'cheerio';

async function scrape(malId: number) {
  const url = `https://myanimelist.net/anime/${malId}/characters`;
  console.log("Scraping:", url);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  if (!res.ok) {
    console.log("Failed:", res.status);
    return;
  }
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const characters: any[] = [];
  
  $('table.js-anime-character-table').each((i, el) => {
    // Each table has character on left, VA on right
    const $charTd = $(el).find('td').eq(1); // 0 is img, 1 is char info
    const name = $charTd.find('h3').text().trim();
    const role = $charTd.find('div.spaceit_pad').text().trim();
    const charImg = $(el).find('td').eq(0).find('img').attr('data-src') || $(el).find('td').eq(0).find('img').attr('src');
    
    // VAs
    const vas: any[] = [];
    $(el).find('td.va-td').each((j, vaEl) => {
       const vaName = $(vaEl).find('.spaceit_pad a').text().trim();
       const vaLang = $(vaEl).find('div.spaceit_pad').eq(1).text().trim(); // the small text
       vas.push({ name: vaName, language: vaLang });
    });
    
    if (name) {
      characters.push({ name, role, charImg, vas });
    }
  });
  
  console.log(`Found ${characters.length} characters`);
  console.log(JSON.stringify(characters.slice(0, 2), null, 2));
}

scrape(21);
