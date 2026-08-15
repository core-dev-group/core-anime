import { getCompleteAnimeDetail } from "./app/lib/malClient";

async function run() {
  const title = "Mushoku Tensei: Isekai Ittara Honki Dasu Season 2 Part 2 Subtitle Indonesia";
  console.log("Fetching for:", title);
  const result = await getCompleteAnimeDetail(title);
  if (result) {
    console.log("MAL ID:", result.malInfo.mal_id);
    console.log("Clean Title (from MAL):", result.malInfo.title);
    console.log("Characters Count:", result.characters.length);
  } else {
    console.log("Returned null");
  }
}

run();
