import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Select, Divider, Drawer, Tooltip } from 'antd';
import {
  ArrowLeftOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { COLOR_MAP, BUDGET_INFO } from '../../data/mockData';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import CardList from '../../components/CardList/CardList';
import './DeckDetailPage.css';

export default function DeckDetailPage({ 
  decks, 
  onUpdateDeck,
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const deck = useMemo(() => decks.find((d) => d.id === id), [decks, id]);

  const [editName, setEditName] = useState(deck?.name || '');
  const [localCards, setLocalCards] = useState(deck?.cards || []);

  if (!deck) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#5d6080' }}>
        <h2>Mazo no encontrado</h2>
        <Button type="link" onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  const handleRemoveCard = (cardId) => {
    setLocalCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const budgetOptions = Object.entries(BUDGET_INFO).map(([key, info]) => ({
    value: key,
    label: info.label,
  }));

  return (
    <div className="deck-detail" id="deck-detail-page">
      <div className="deck-detail__content">
        
        {/* Back button */}
        <div className="deck-detail__back">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="deck-detail__back-btn"
            onClick={() => {
              // Navigation back to list
              onUpdateDeck(id, { name: editName, cards: localCards });
              navigate('/');
            }}
            id="back-to-main"
          >
            Volver a mis mazos
          </Button>
        </div>

        {/* Deck header */}
        <div className="deck-detail__header">
          <img
            className="deck-detail__commander-img"
            src={deck.commanderImage}
            alt={deck.commander}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/180x180/13152a/d4a537?text=Commander';
            }}
          />
          <div className="deck-detail__info">
            <Input
              className="deck-detail__edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              size="large"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700 }}
              id="edit-deck-name"
            />
            <p className="deck-detail__commander-name">{deck.commander}</p>

            <div className="deck-detail__meta-row">
              <span className="deck-detail__bracket-tag" style={{ background: 'rgba(212, 165, 55, 0.1)', color: '#d4a537', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(212, 165, 55, 0.3)', fontWeight: 600 }}>
                Bracket {deck.bracket}
              </span>

              <div className="deck-detail__colors">
                {deck.colors.map((c) => (
                  <Tooltip key={c} title={COLOR_MAP[c]?.label || c}>
                    <img 
                      className="deck-detail__color-dot"
                      style={{ objectFit: 'contain', padding: 0, background: '#000', border: 'none' }}
                      src={COLOR_MAP[c]?.image} 
                      alt={c} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </Tooltip>
                ))}
              </div>

              <span className="deck-detail__card-count">
                {localCards.length} cartas
              </span>
            </div>
          </div>
        </div>

        <Divider className="deck-detail__divider" />

        {/* Cards section */}
        <h2 className="deck-detail__section-title">Cartas del Mazo</h2>
        <CardList
          cards={localCards}
          isEditMode={true}
          onRemoveCard={handleRemoveCard}
        />
      </div>

      {/* Desktop chat sidebar */}
      <div className={`deck-detail__chat-panel ${!isChatOpen ? 'deck-detail__chat-panel--closed' : ''}`}>
        <ChatAssistant 
          context={deck.name} 
          messages={chatMessages}
          isTyping={isChatTyping}
          onSendMessage={onSendMessage}
        />
      </div>

      {/* Mobile chat toggle */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        className="chat-toggle-btn"
        onClick={() => setIsChatOpen(true)}
        id="mobile-chat-toggle-detail"
      />

      {/* Mobile chat drawer */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setIsChatOpen(false)}
        open={isChatOpen}
        width={340}
        styles={{ body: { padding: 0, height: '100%' } }}
        className="mobile-only-drawer"
      >
        <ChatAssistant 
          context={deck.name} 
          className="chat-assistant--drawer" 
          messages={chatMessages}
          isTyping={isChatTyping}
          onSendMessage={onSendMessage}
        />
      </Drawer>
    </div>
  );
}
