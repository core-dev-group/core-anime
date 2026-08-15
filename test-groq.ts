import 'dotenv/config';

const rawTitle = "Hell Mode Season 2 Subtitle Indonesia";
const sankaData = {
  title: rawTitle,
  studios: "",
  type: "TV",
  status: "Ongoing",
  episodes: "7"
};

let contextStr = `Title: "${rawTitle}"`;
if (sankaData.studios) contextStr += `\nStudio: ${sankaData.studios}`;
if (sankaData.type) contextStr += `\nType: ${sankaData.type}`;
if (sankaData.status) contextStr += `\nStatus: ${sankaData.status}`;
if (sankaData.episodes) contextStr += `\nEpisodes: ${sankaData.episodes}`;

fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "You are an expert anime database mapper. I will give you a title from an Indonesian site. Your job is to translate or map this title to its EXACT OFFICIAL Romaji title on MyAnimeList.\n\nRULES:\n1. Indonesian sites often use alternate names (e.g., 'Hell Mode', 'Failure Frame', etc). You MUST map it to the official Romaji title.\n2. Keep 'Season 2', 'Part 2', etc. to denote the correct sequel.\n3. Output ONLY the mapped official title as plain text. Do not add quotes or explanations."
      },
      {
        role: "user",
        content: `Map this anime to its official Romaji title:\n${contextStr}`
      }
    ],
    temperature: 0.1,
    max_tokens: 50
  })
}).then(r => r.json()).then(data => console.log(data.choices[0].message.content)).catch(console.error);
