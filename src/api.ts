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
- "front": The english translation of the word.  For nouns include the article "the".

- "back": The Spanish translation of the word and the european spanish IPA pronunciation, including stress marks.  For nouns that can be inflected based on gender, use a linefeed to show both form. e.g. "el profesor [/ˈpro.fes.oɾ]<br>la profesora [ˈpro.fes.oɾa]"

- "extra"
  - If the word has irregular inflections or conjugation or pronunciation, or the accents change on inflection, include a short explanation of the irregularities. If the word follows regular patterns for it's part of speech, do not include this section.
  - Include two short sentences incorporating the word, appropriate for an A1 spanish student.
    - These may use its inflected forms as natural.
    - Include each sentence's english translation below in italics (<i>...</i>).
    - Separate each sentence by two blank lines.
    - Omit pronouns before conjugated verbs where idiomatic.

- "tags": An array of categories for the word. 
  - Include the part of speech.
  - For nouns, include the gender: "masculine", "feminine", or "neuter" if both genders have the same form.
  - For nouns, if the word has irregular inflections, include "irregular".
  - For verbs, include "regular" or "irregular" as appropriate.

Only respond with the JSON object, no other text.
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

export interface NGrams {
  [englishPhrase: string]: string; // english phrase -> spanish phrase
}

export async function generateNGrams(word: string): Promise<NGrams> {
  const prompt = `
I am an A1 Spanish student trying to learn to use the word "${word}".

Please think carefully through your answer and provide only the most idiomatically interesting and commonly used n-grams for this word (or its inflections/conjugations) with their english translations.

Focus on phrases that:
- Are idiomatic and express something more than the sum of their parts
- Are in common, everyday usage by native speakers
- Would help an A1 student sound more natural when speaking Spanish

Do not include:
- Meta commentary or explanatory context.
- n-grams that merely add common function words in regular ways
- Phrases that are too literal or mechanical
- Uncommon or overly formal expressions
- Phrases where the word is used in its most basic dictionary sense without any idiomatic quality

Format your answer as a JSON object where the keys are the english phrases and the values are the spanish phrases followed by <br> followed by the Castilian spanish IPA pronunciation.
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
    const ngrams = JSON.parse(jsonText) as NGrams;
    return ngrams;
  } catch (error) {
    throw new Error(`Failed to parse n-grams JSON: ${error}`);
  }
}

export async function addCardsToAnki(cards: Card[]): Promise<void> {
  // Add all cards
  for (const card of cards) {
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
            deckName: "Spanish n-grams",
            modelName: "Basic",
            fields: {
              Front: card.front.replace(/\r?\n/g, "<br>"),
              Back: card.back.replace(/\r?\n/g, "<br>"),
              ...(card.extra && {
                Extra: card.extra.replace(/\r?\n/g, "<br>"),
              }),
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
  }

  // Sync with AnkiWeb after adding all cards
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

export async function generateEnglishCard(word: string): Promise<Card> {
  const prompt = `
Make a bidirectional Anki flashcard for the English word or phrase "${word}".
If the input includes disambiguation or context in parentheses, use that to clarify the meaning.

Format your answer as a JSON object with the following properties:
- "front": The English word or phrase (without the disambiguation if it was in parentheses)
- "back": A clear and concise definition that would help someone understand the word/phrase. 
- "extra": 
  - IPA pronunciation of the word/phrase.
  - A short sentence incorporating the word, appropriate for a native English speaker.
  - Related words or synonyms.
- "tags": An array of categories for the word. 

Remember that Anki uses html for formatting, so use <br> for line breaks, <i> for italics, and <b> for bold.

Only respond with the JSON object, no other text.
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

export async function addEnglishCardToAnki(card: Card): Promise<void> {
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
          deckName: "English",
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
