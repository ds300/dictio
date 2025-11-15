import { useState } from "react";
import { generateNGrams, addCardsToAnki, NGrams, Card } from "../api";

interface NGramItem {
  id: string;
  english: string;
  spanish: string;
  selected: boolean;
}

export default function NGramsPage() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [ngramItems, setNgramItems] = useState<NGramItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    setNgramItems([]);
    setSuccess(false);

    try {
      const ngrams = await generateNGrams(word.trim());
      
      // Convert NGrams object to array of items, all selected by default
      const items: NGramItem[] = Object.entries(ngrams).map(([english, spanish], index) => ({
        id: `ngram-${index}`,
        english,
        spanish,
        selected: true,
      }));
      
      setNgramItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate n-grams");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setNgramItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleEnglishChange = (id: string, value: string) => {
    setNgramItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, english: value } : item))
    );
  };

  const handleSpanishChange = (id: string, value: string) => {
    setNgramItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, spanish: value } : item))
    );
  };

  const handleAddCards = async () => {
    const selectedItems = ngramItems.filter((item) => item.selected);
    
    if (selectedItems.length === 0) {
      setError("Please select at least one n-gram to add");
      return;
    }

    setIsAdding(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert selected items to cards
      const cards: Card[] = selectedItems.map((item) => ({
        front: item.english,
        back: item.spanish,
        tags: ["n-gram"],
      }));

      await addCardsToAnki(cards);
      setSuccess(true);
      
      // Clear the form after successful addition
      setTimeout(() => {
        setNgramItems([]);
        setWord("");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add cards to Anki"
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: 700 }}>
        Spanish N-grams
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a Spanish word"
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
            {loading ? "Generating..." : "Generate N-grams"}
          </button>
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
          Cards successfully added to Anki!
        </div>
      )}

      {ngramItems.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              marginBottom: "1rem",
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            N-grams ({ngramItems.filter((item) => item.selected).length} selected)
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {ngramItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1rem",
                  background: item.selected ? "#f9f9f9" : "#f5f5f5",
                  borderRadius: "4px",
                  border: `1px solid ${item.selected ? "#ddd" : "#ccc"}`,
                  opacity: item.selected ? 1 : 0.7,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => handleToggleSelect(item.id)}
                  disabled={isAdding}
                  style={{
                    marginTop: "0.5rem",
                    width: "1.25rem",
                    height: "1.25rem",
                    cursor: isAdding ? "not-allowed" : "pointer",
                  }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                        color: "#666",
                        fontSize: "0.875rem",
                      }}
                    >
                      English:
                    </div>
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => handleEnglishChange(item.id, e.target.value)}
                      disabled={isAdding}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "white",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                        color: "#666",
                        fontSize: "0.875rem",
                      }}
                    >
                      Spanish:
                    </div>
                    <input
                      type="text"
                      value={item.spanish}
                      onChange={(e) => handleSpanishChange(item.id, e.target.value)}
                      disabled={isAdding}
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        fontSize: "1rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        background: "white",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddCards}
            disabled={isAdding || ngramItems.filter((item) => item.selected).length === 0}
            style={{
              width: "100%",
              padding: "0.75rem",
              background:
                isAdding || ngramItems.filter((item) => item.selected).length === 0
                  ? "#ccc"
                  : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor:
                isAdding || ngramItems.filter((item) => item.selected).length === 0
                  ? "not-allowed"
                  : "pointer",
              marginTop: "1.5rem",
            }}
          >
            {isAdding
              ? "Adding to Anki..."
              : `Add ${ngramItems.filter((item) => item.selected).length} Card${ngramItems.filter((item) => item.selected).length !== 1 ? "s" : ""} to Anki`}
          </button>
        </div>
      )}
    </div>
  );
}







