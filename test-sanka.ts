async function run() {
  const SANKA_URL = "https://sanka-mu.vercel.app";
  const slug = "hmode-s2-sub-indo";
  const url = `${SANKA_URL}/api/anime/otakudesu/detail/${slug}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("Episodes:", data.data.episodes);
  console.log("Episode List Length:", data.data.episodeList?.length);
}
run();
