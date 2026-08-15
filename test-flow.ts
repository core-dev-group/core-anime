import { fetchSanka } from "./app/lib/sankaClient";
import { getCompleteAnimeDetail } from "./app/lib/malClient";

async function run() {
  console.log("Fetching /home from Sanka API...");
  const data = await fetchSanka("/home");
  const ongoing = data.data.ongoing[0];
  const title = ongoing.title;
  console.log("Found Title on Sanka:", title);

  const detail = await getCompleteAnimeDetail(title);
  if (detail) {
    console.log("MAL Matched Title:", detail.malInfo.title);
    console.log("Episodes on Sanka:", ongoing.episodes);
    console.log("Episodes on MAL:", detail.malInfo.episodes);
    console.log("Score on MAL:", detail.malInfo.score);
  } else {
    console.log("MAL Match FAILED.");
  }
}

run();
