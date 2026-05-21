import { Button, Tooltip, Dropdown } from 'antd';
import { DeleteOutlined, FileTextOutlined, GlobalOutlined, LockOutlined, CopyOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DeleteConfirm from '../DeleteConfirm/DeleteConfirm';
import './DeckCard.css';

export default function DeckCard({ deck, onDelete, onExport, onCopy, onToggleVisibility, isPublicView }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/deck/${deck.id}`);
  };

  const handleExportClick = (e) => {
    e.stopPropagation();
    if (onExport) onExport(deck);
  };

  const handleCopyClick = (e) => {
    e.stopPropagation();
    if (onCopy) onCopy(deck);
  };

  const visibilityMenu = [
    {
      key: 'public',
      label: 'Hacer Público',
      icon: <GlobalOutlined />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        if (onToggleVisibility) onToggleVisibility(deck, true);
      }
    },
    {
      key: 'private',
      label: 'Hacer Privado',
      icon: <LockOutlined />,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        if (onToggleVisibility) onToggleVisibility(deck, false);
      }
    }
  ];

  return (
    <div className="deck-card" id={`deck-card-${deck.id}`} onClick={handleCardClick}>
      <div className="deck-card__image-wrapper">
        <img
          className="deck-card__image"
          src={deck.commanderImage}
          alt={deck.commander}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200/1a1710/c4952a?text=Commander';
          }}
        />
        <span className="deck-card__bracket-badge">B{deck.bracket}</span>
        
        {!isPublicView && (
          <div className="deck-card__visibility-badge" style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(26,23,16,0.8)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {deck.is_public ? <GlobalOutlined style={{ color: '#c4952a' }} /> : <LockOutlined style={{ color: '#b8a88a' }} />}
            <span style={{ color: deck.is_public ? '#e8dcc4' : '#b8a88a', fontSize: '12px', fontWeight: 500 }}>
              {deck.is_public ? 'Público' : 'Privado'}
            </span>
          </div>
        )}
      </div>

      <div className="deck-card__body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 className="deck-card__name">{deck.name}</h3>
            <p className="deck-card__commander">{deck.commander}</p>
          </div>
          {isPublicView && deck.owner_username && (
            <span style={{ fontSize: '12px', color: '#c4952a', background: 'rgba(196,149,42,0.1)', padding: '2px 8px', borderRadius: '12px' }}>
              @{deck.owner_username}
            </span>
          )}
        </div>

        <div className="deck-card__meta">
          <div className="deck-card__colors">
            {deck.colors.map((c) => (
              <Tooltip key={c} title={c}>
                <img
                  className="deck-card__color-img"
                  src={`https://svgs.scryfall.io/card-symbols/${c}.svg`}
                  alt={c}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Tooltip>
            ))}
          </div>
          <span className="deck-card__card-count">{deck.cardCount} cartas</span>
        </div>

        <div className="deck-card__actions">
          <Tooltip title="Copiar Mazo">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={handleCopyClick}
              style={{ color: '#b8a88a' }}
            />
          </Tooltip>

          <Tooltip title="Exportar como Texto">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={handleExportClick}
              className="deck-card__export-btn"
              id={`export-deck-${deck.id}`}
            />
          </Tooltip>

          {!isPublicView && (
            <>
              <Dropdown menu={{ items: visibilityMenu }} trigger={['click']}>
                <Tooltip title="Opciones de Visibilidad">
                  <Button
                    type="text"
                    icon={<SettingOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#c4952a' }}
                  />
                </Tooltip>
              </Dropdown>
              
              <DeleteConfirm onConfirm={() => onDelete(deck.id)}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  id={`delete-deck-${deck.id}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </DeleteConfirm>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
