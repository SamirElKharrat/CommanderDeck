import { Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { COLOR_MAP, BUDGET_INFO } from '../../data/mockData';
import DeleteConfirm from '../DeleteConfirm/DeleteConfirm';
import './DeckCard.css';

export default function DeckCard({ deck, onDelete }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/deck/${deck.id}`);
  };

  return (
    <div className="deck-card" id={`deck-card-${deck.id}`} onClick={handleCardClick}>
      <div className="deck-card__image-wrapper">
        <img
          className="deck-card__image"
          src={deck.commanderImage}
          alt={deck.commander}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200/13152a/d4a537?text=Commander';
          }}
        />
        <span className="deck-card__bracket-badge">B{deck.bracket}</span>
      </div>

      <div className="deck-card__body">
        <h3 className="deck-card__name">{deck.name}</h3>
        <p className="deck-card__commander">{deck.commander}</p>

        <div className="deck-card__meta">
          <div className="deck-card__colors">
            {deck.colors.map((c) => (
              <Tooltip key={c} title={COLOR_MAP[c]?.label || c}>
                <img 
                  className="deck-card__color-img"
                  src={COLOR_MAP[c]?.image} 
                  alt={c} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Tooltip>
            ))}
          </div>
          <span className="deck-card__card-count">{deck.cardCount} cartas</span>
        </div>

        <div className="deck-card__delete-btn">
          <DeleteConfirm onConfirm={() => onDelete(deck.id)}>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              id={`delete-deck-${deck.id}`}
            />
          </DeleteConfirm>
        </div>
      </div>
    </div>
  );
}
