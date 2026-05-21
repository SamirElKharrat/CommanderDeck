import { InboxOutlined } from '@ant-design/icons';
import DeckCard from '../DeckCard/DeckCard';
import './DeckGrid.css';

export default function DeckGrid({ decks, onDelete, onExport, onCopy, onToggleVisibility, isPublicView }) {
  return (
    <div className="deck-grid" id="deck-grid">
      <div className="deck-grid__container">
        {decks.length === 0 ? (
          <div className="deck-grid__empty">
            <InboxOutlined className="deck-grid__empty-icon" />
            <h3 className="deck-grid__empty-title">
              {isPublicView ? 'No se encontraron mazos públicos' : 'No tienes mazos aún'}
            </h3>
            {!isPublicView && (
              <p className="deck-grid__empty-text">
                Pulsa &quot;Crear Mazo&quot; para empezar a construir tu primer mazo de Commander.
              </p>
            )}
          </div>
        ) : (
          decks.map((deck) => (
            <DeckCard 
              key={deck.id} 
              deck={deck} 
              onDelete={onDelete} 
              onExport={onExport} 
              onCopy={onCopy}
              onToggleVisibility={onToggleVisibility}
              isPublicView={isPublicView}
            />
          ))
        )}
      </div>
    </div>
  );
}
