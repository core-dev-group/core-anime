async function run() {
  const apiKey = "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";
  const titles = [
    "Tensei shitara Slime Datta Ken Season 3 Episode 20 Subtitle Indonesia",
    "Mushoku Tensei: Isekai Ittara Honki Dasu Season 2 Part 2 Subtitle Indonesia",
    "Boku no Hero Academia Season 7 Episode 13 Sub Indo",
    "Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka V: Houjou no Megami-hen Episode 14 Subtitle Indonesia"
  ];
  for (const rawTitle of titles) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "system",
                content: "You are a rigid parsing bot. Extract the pure Romaji or English anime title from the given string. IMPORTANT RULES:\n1. Keep 'Season X', 'Part Y', 'Cour Z', or Roman numerals (II, III, V) if they exist. This is CRITICAL to identify the correct sequel.\n2. REMOVE tags like 'Sub Indo', 'Subtitle Indonesia', 'Batch', 'Episode X', resolutions, etc.\n3. Output ONLY the final extracted title as plain text. No quotes. No conversational text."
              },
              {
                role: "user",
                content: `Extract clean title from: "${rawTitle}"`
              }
            ],
            temperature: 0.1,
            max_tokens: 50
          })
        });
        const data = await response.json();
        console.log("Original:", rawTitle);
        console.log("Groq Output:", data.choices[0].message.content.trim());
        console.log("---");
  }
}
run();
