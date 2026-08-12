import fetch from 'node-fetch';

async function test() {
  const res = await fetch('https://www.sankavollerei.web.id/anime/anime/jshk-s2-sub-indo');
  const json = await res.json();
  console.log(JSON.stringify(json.data.batch, null, 2));
}

test();
