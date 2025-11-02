export interface Card {
  front: string;
  back: string;
  extra?: string;
  tags: string[];
}

export async function generateCard(word: string): Promise<Card> {
  const prompt = `
Make an Anki flashcard for the Spanish word "${word}".
If the word is an inflected or conjugated form, use the base form.

Format your answer as a JSON object with the following properties:
- "front"
  The english translation of the word.
  For nouns include the article "the".
- "back"
  The Spanish translation of the word and the european spanish IPA pronunciation, including stress marks.
  For nouns that can be inflected based on gender, use a linefeed to show both form. e.g. "el profesor [/ˈpro.fes.oɾ]<br>la profesora [ˈpro.fes.oɾa]"
- "extra"
  If the word has irregular inflections or conjugation or pronunciation, include a short explanation of the irregularities.
  Include two short sentences incorporating the word, appropriate for an A1 spanish student.
  These may use its inflected forms as natural.
  Include each sentence's english translation below in italics (<i>...</i>).
  Separate each sentence by two blank lines.
- "tags"
  A list of categories for the word. 
  - Include the part of speech.
  - For nouns, include the gender: "masculine", "feminine", or "neuter" if both genders have the same form.
  - For verbs, include "regular" or "irregular" as appropriate.
`;

  const response = await fetch("/api/anthropic/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  // Parse JSON from the response text (might have markdown code blocks)
  let jsonText = text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const card = JSON.parse(jsonText) as Card;
    return card;
  } catch (error) {
    throw new Error(`Failed to parse card JSON: ${error}`);
  }
}

export async function addCardToAnki(card: Card): Promise<void> {
  // Add the card
  const response = await fetch("/api/anki", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "addNote",
      version: 6,
      params: {
        note: {
          deckName: "Spanish Vocabulary",
          modelName: "Basic",
          fields: {
            Front: card.front.replace(/\r?\n/g, "<br>"),
            Back: card.back.replace(/\r?\n/g, "<br>"),
            ...(card.extra && { Extra: card.extra.replace(/\r?\n/g, "<br>") }),
          },
          tags: card.tags,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }

  // Sync with AnkiWeb
  const syncResponse = await fetch("/api/anki", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "sync",
      version: 6,
    }),
  });

  if (!syncResponse.ok) {
    // Log sync error but don't fail the card addition
    console.warn("Failed to sync with AnkiWeb:", syncResponse.status);
  } else {
    const syncResult = await syncResponse.json();
    if (syncResult.error) {
      console.warn("AnkiWeb sync error:", syncResult.error);
    }
  }
}
