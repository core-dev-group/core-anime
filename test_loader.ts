import { getCompleteAnimeDetail } from "./app/lib/malClient.ts";
async function test() {
  const malId = 56734;
  console.log("Fetching for ID:", malId);
  const data = await getCompleteAnimeDetail(malId);
  console.log("Result:", data ? "SUCCESS" : "NULL");
  if (data) {
    console.log("Characters count:", data.characters?.length);
    console.log("Music:", data.malInfo?.opening_themes?.length, data.malInfo?.ending_themes?.length);
  }
}
test();
