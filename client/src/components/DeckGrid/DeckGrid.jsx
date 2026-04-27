import { InboxOutlined } from '@ant-design/icons';
import DeckCard from '../DeckCard/DeckCard';
import './DeckGrid.css';

export default function DeckGrid({ decks, onDelete }) {
  return (
    <div className="deck-grid" id="deck-grid">
      <h2 className="deck-grid__title">Mis Mazos</h2>
      <div className="deck-grid__container">
        {decks.length === 0 ? (
          <div className="deck-grid__empty">
            <InboxOutlined className="deck-grid__empty-icon" />
            <h3 className="deck-grid__empty-title">No tienes mazos aún</h3>
            <p className="deck-grid__empty-text">
              Pulsa &quot;Crear Mazo&quot; para empezar a construir tu primer mazo de Commander.
            </p>
          </div>
        ) : (
          decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
