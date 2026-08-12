import { sankaApi } from "../app/lib/sankaClient";

async function fetchRaw() {
  const res = await fetch("https://otakudesu-api-livid.vercel.app/api/schedule", {
    headers: { 'Accept': 'application/json' }
  });
  const json = await res.json();
  console.log(JSON.stringify(json.data[0].animeList[0], null, 2));
}

fetchRaw();
