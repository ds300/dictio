import { useState } from "react";
import VocabularyPage from "./components/VocabularyPage";
import NGramsPage from "./components/NGramsPage";
import EnglishPage from "./components/EnglishPage";

type Page = "vocabulary" | "ngrams" | "english";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("vocabulary");

  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #e0e0e0",
          paddingBottom: "1rem",
        }}
      >
        <button
          onClick={() => setCurrentPage("vocabulary")}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            fontWeight: currentPage === "vocabulary" ? 600 : 400,
            background: "transparent",
            border: "none",
            borderBottom:
              currentPage === "vocabulary"
                ? "2px solid #2196f3"
                : "2px solid transparent",
            color: currentPage === "vocabulary" ? "#2196f3" : "#666",
            cursor: "pointer",
            marginBottom: "-1rem",
            paddingBottom: "1rem",
          }}
        >
          Vocabulary
        </button>
        <button
          onClick={() => setCurrentPage("ngrams")}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            fontWeight: currentPage === "ngrams" ? 600 : 400,
            background: "transparent",
            border: "none",
            borderBottom:
              currentPage === "ngrams"
                ? "2px solid #2196f3"
                : "2px solid transparent",
            color: currentPage === "ngrams" ? "#2196f3" : "#666",
            cursor: "pointer",
            marginBottom: "-1rem",
            paddingBottom: "1rem",
          }}
        >
          N-grams
        </button>
        <button
          onClick={() => setCurrentPage("english")}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            fontWeight: currentPage === "english" ? 600 : 400,
            background: "transparent",
            border: "none",
            borderBottom:
              currentPage === "english"
                ? "2px solid #2196f3"
                : "2px solid transparent",
            color: currentPage === "english" ? "#2196f3" : "#666",
            cursor: "pointer",
            marginBottom: "-1rem",
            paddingBottom: "1rem",
          }}
        >
          English
        </button>
      </nav>

      {currentPage === "vocabulary" && <VocabularyPage />}
      {currentPage === "ngrams" && <NGramsPage />}
      {currentPage === "english" && <EnglishPage />}
    </div>
  );
}
