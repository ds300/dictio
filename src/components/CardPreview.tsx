import { useState, useEffect, useRef } from "react";
import { Card } from "../api";

interface CardPreviewProps {
  card: Card;
  onApprove: (card: Card) => void;
  isAdding: boolean;
}

export default function CardPreview({
  card: initialCard,
  onApprove,
  isAdding,
}: CardPreviewProps) {
  const [card, setCard] = useState<Card>(initialCard);
  const frontRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLTextAreaElement>(null);
  const extraRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCard(initialCard);
  }, [initialCard]);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const minHeight = parseInt(getComputedStyle(textarea).minHeight) || 60;
    textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight(frontRef.current);
    adjustTextareaHeight(backRef.current);
    adjustTextareaHeight(extraRef.current);
  }, [card]);

  const handleFieldChange = (field: keyof Card, value: string | string[]) => {
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextareaChange = (
    field: keyof Card,
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleFieldChange(field, e.target.value);
    adjustTextareaHeight(e.target);
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    handleFieldChange("tags", tags);
  };

  return (
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
        style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}
      >
        Card Preview (Editable)
      </h2>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#666" }}>
          Front:
        </div>
        <textarea
          ref={frontRef}
          value={card.front}
          onChange={(e) => handleTextareaChange("front", e)}
          disabled={isAdding}
          style={{
            width: "100%",
            minHeight: "60px",
            padding: "0.75rem",
            background: "#f9f9f9",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            fontFamily: "inherit",
            resize: "none",
            overflow: "hidden",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#666" }}>
          Back:
        </div>
        <textarea
          ref={backRef}
          value={card.back}
          onChange={(e) => handleTextareaChange("back", e)}
          disabled={isAdding}
          style={{
            width: "100%",
            minHeight: "80px",
            padding: "0.75rem",
            background: "#f9f9f9",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            fontFamily: "inherit",
            resize: "none",
            overflow: "hidden",
          }}
        />
        <div
          style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}
        >
          Use &lt;br&gt; for line breaks
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#666" }}>
          Extra:
        </div>
        <textarea
          ref={extraRef}
          value={card.extra || ""}
          onChange={(e) => handleTextareaChange("extra", e)}
          disabled={isAdding}
          placeholder="Optional: Extra information..."
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "0.75rem",
            background: "#f9f9f9",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            fontFamily: "inherit",
            resize: "none",
            overflow: "hidden",
          }}
        />
        <div
          style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}
        >
          Use &lt;br&gt; for line breaks, &lt;i&gt;...&lt;/i&gt; for italics
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#666" }}>
          Tags:
        </div>
        <input
          type="text"
          value={card.tags.join(", ")}
          onChange={(e) => handleTagsChange(e.target.value)}
          disabled={isAdding}
          placeholder="noun, masculine, regular"
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "#f9f9f9",
            borderRadius: "4px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            fontFamily: "inherit",
          }}
        />
        <div
          style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}
        >
          Separate tags with commas
        </div>
        {card.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {card.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  padding: "0.25rem 0.75rem",
                  background: "#e3f2fd",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  color: "#1976d2",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onApprove(card)}
        disabled={isAdding}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: isAdding ? "#ccc" : "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: isAdding ? "not-allowed" : "pointer",
          marginTop: "1rem",
        }}
      >
        {isAdding ? "Adding to Anki..." : "Add to Anki"}
      </button>
    </div>
  );
}
