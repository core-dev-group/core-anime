import { getCompleteAnimeDetail } from "./app/lib/malClient";

async function run() {
  const title = "Tensei shitara Slime Datta Ken Season 3 Episode 20 Subtitle Indonesia";
  console.log("Fetching for:", title);
  
  // Set env vars
  process.env.GROQ_API_KEY = "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";
  process.env.MAL_CLIENT_ID = "611132154a400bb8e5da8584b648d2cb";
  
  const result = await getCompleteAnimeDetail(title);
  if (result) {
    console.log("MAL ID:", result.malInfo.mal_id);
    console.log("Clean Title (from MAL):", result.malInfo.title);
    console.log("Episodes on MAL:", result.malInfo.episodes);
    console.log("Characters Count:", result.characters.length);
  } else {
    console.log("Returned null");
  }
}

run();
