import { sankaApi } from "../app/lib/sankaClient";
async function run() {
  try {
    const data = await sankaApi.getSchedule();
    console.log(JSON.stringify(data[0].animeList[0], null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
