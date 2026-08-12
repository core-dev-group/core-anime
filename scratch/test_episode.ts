import { sankaApi } from "../app/lib/sankaClient";

async function fetchRaw() {
  const res = await sankaApi.getEpisodeDetail("boushoku-no-berserk-episode-1-sub-indo");
  console.log(JSON.stringify(res.downloadUrl, null, 2));
}

fetchRaw();
