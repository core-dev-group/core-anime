import { fetchWithFallback } from "./app/lib/providers/registry";

async function main() {
  try {
    const data = await fetchWithFallback("home", p => p.getHome());
    console.log("Success:", data.length);
    console.log("First item:", JSON.stringify(data[0], null, 2));
  } catch (err) {
    console.error("Failed:", err);
  }
}
main();
