import { Card } from '../api';

interface CardPreviewProps {
  card: Card;
  onApprove: () => void;
  isAdding: boolean;
}

export default function CardPreview({ card, onApprove, isAdding }: CardPreviewProps) {
  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Card Preview</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>Front:</div>
        <div style={{ padding: '0.75rem', background: '#f9f9f9', borderRadius: '4px' }}>{card.front}</div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>Back:</div>
        <div 
          style={{ padding: '0.75rem', background: '#f9f9f9', borderRadius: '4px' }}
          dangerouslySetInnerHTML={{ __html: card.back }}
        />
      </div>

      {card.extra && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>Extra:</div>
          <div 
            style={{ padding: '0.75rem', background: '#f9f9f9', borderRadius: '4px' }}
            dangerouslySetInnerHTML={{ __html: card.extra }}
          />
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#666' }}>Tags:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {card.tags.map((tag, i) => (
            <span 
              key={i}
              style={{ 
                padding: '0.25rem 0.75rem', 
                background: '#e3f2fd', 
                borderRadius: '12px', 
                fontSize: '0.875rem',
                color: '#1976d2'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onApprove}
        disabled={isAdding}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: isAdding ? '#ccc' : '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: isAdding ? 'not-allowed' : 'pointer',
          marginTop: '1rem',
        }}
      >
        {isAdding ? 'Adding to Anki...' : 'Add to Anki'}
      </button>
    </div>
  );
}

