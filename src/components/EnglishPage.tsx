import { useState } from "react";
import { generateEnglishCard, addEnglishCardToAnki, Card } from "../api";
import CardPreview from "./CardPreview";

export default function EnglishPage() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    setCard(null);
    setSuccess(false);

    try {
      const generatedCard = await generateEnglishCard(word.trim());
      setCard(generatedCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate card");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (editedCard: Card) => {
    setIsAdding(true);
    setError(null);
    setSuccess(false);

    try {
      await addEnglishCardToAnki(editedCard);
      setSuccess(true);
      setCard(null);
      setWord("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add card to Anki"
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: 700 }}>
        English Vocabulary Card Maker
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder='Enter an English word or phrase (e.g., "bank (financial)" or "run")'
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.75rem",
              fontSize: "1rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit"
            disabled={loading || !word.trim()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              background: loading || !word.trim() ? "#ccc" : "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !word.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating..." : "Generate Card"}
          </button>
        </div>
        <div
          style={{
            fontSize: "0.875rem",
            color: "#666",
            marginTop: "0.5rem",
          }}
        >
          You can include disambiguation or context in parentheses, e.g., "bank
          (financial)" or "run (verb)"
        </div>
      </form>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          Error: {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "1rem",
            background: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          Card successfully added to Anki!
        </div>
      )}

      {card && (
        <CardPreview
          card={card}
          onApprove={handleApprove}
          isAdding={isAdding}
        />
      )}
    </div>
  );
}

