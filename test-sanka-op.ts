async function run() {
  const SANKA_URL = "https://sanka-mu.vercel.app";
  const slug = "wpoiec-sub-indo"; // From the user's batch slug "wpoiec-batch-sub-indo", anime slug is "wpoiec-sub-indo" or "one-piece-sub-indo"?
  // wait let me search otakudesu for one piece
  const search = await fetch(`${SANKA_URL}/api/anime/otakudesu/search?q=one+piece`);
  const sData = await search.json();
  const opSlug = sData.data[0].slug;
  const url = `${SANKA_URL}/api/anime/otakudesu/detail/${opSlug}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("Episodes:", data.data.episodes);
  console.log("Episode List Length:", data.data.episodeList?.length);
  
  // also let's test MAL
  const malId = 21; // One Piece
  const malRes = await fetch(`https://api.jikan.moe/v4/anime/21`);
  const malData = await malRes.json();
  console.log("MAL Episodes:", malData.data.episodes);
}
run();
