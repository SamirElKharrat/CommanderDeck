import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Divider, Drawer, Tooltip, message } from 'antd';
import { ArrowLeftOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import CardList from '../../components/CardList/CardList';
import ExportDeckModal from '../../components/ExportDeckModal/ExportDeckModal';
import { updateDeck as apiUpdateDeck, removeCardFromDeck } from '../../api/decks';
import './DeckDetailPage.css';

export default function DeckDetailPage({ 
  decks, 
  onUpdateDeck,
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen,
  setActiveDeckId,
  onRefreshDecks
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const deck = useMemo(() => decks.find((d) => String(d.id) === String(id)), [decks, id]);

  const [editName, setEditName] = useState(deck?.name || '');
  const [localCards, setLocalCards] = useState(deck?.cards || []);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // ... (useEffect and other functions remain the same until return)
  useEffect(() => {
    if (id && setActiveDeckId) {
      setActiveDeckId(parseInt(id));
    }
    return () => {
      if (setActiveDeckId) setActiveDeckId(null);
    };
  }, [id, setActiveDeckId]);

  useEffect(() => {
    if (deck) {
      setEditName(deck.name);
      setLocalCards(deck.cards);
    }
  }, [deck]);

  if (!deck) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#5d6080' }}>
        <h2>Mazo no encontrado</h2>
        <Button type="link" onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  const handleRemoveCard = async (cardId, quantity = 1) => {
    const card = localCards.find((c) => c.id === cardId);
    if (card) {
      try {
        await removeCardFromDeck(deck.id, card.name, quantity);
        message.success(`${quantity}x ${card.name} quitado`);
        if (onRefreshDecks) await onRefreshDecks();
      } catch (err) {
        message.error('Error al quitar carta: ' + err.message);
      }
    }
  };

  const handleSaveName = async () => {
    try {
      await apiUpdateDeck(deck.id, { deck_name: editName.replace(' Deck', '') });
      onUpdateDeck(deck.id, { name: editName });
      message.success('Nombre actualizado');
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <div className="deck-detail" id="deck-detail-page">
      <div className="deck-detail__content">
        
        {/* Back button */}
        <div className="deck-detail__back">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="deck-detail__back-btn"
            onClick={() => navigate('/')}
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
              onBlur={handleSaveName}
              onPressEnter={handleSaveName}
              size="large"
              style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700 }}
              id="edit-deck-name"
            />
            <p className="deck-detail__commander-name">{deck.commander}</p>

            <div className="deck-detail__meta-row">
              <span className="deck-detail__bracket-tag" style={{ background: 'rgba(212, 165, 55, 0.1)', color: '#d4a537', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(212, 165, 55, 0.3)', fontWeight: 600 }}>
                Bracket {deck.bracket}
              </span>

              <span className="deck-detail__card-count">
                {localCards.length} cartas ({localCards.reduce((sum, c) => sum + (c.quantity || 1), 0)} total)
              </span>

              <Tooltip title="Exportar como Texto">
                <Button 
                  icon={<FileTextOutlined />} 
                  onClick={() => setExportModalVisible(true)}
                  className="deck-detail__export-btn"
                >
                  Exportar
                </Button>
              </Tooltip>
            </div>

            <div className="deck-detail__chat-hint">
              <span>💡 Usa el chat para añadir/quitar cartas o cambiar el bracket</span>
            </div>
          </div>
        </div>

        <ExportDeckModal
          visible={exportModalVisible}
          deck={deck}
          onCancel={() => setExportModalVisible(false)}
        />

        <Divider className="deck-detail__divider" />

        {/* Cards section */}
        <h2 className="deck-detail__section-title">Cartas del Mazo</h2>
        <CardList
          cards={localCards}
          isEditMode={true}
          onRemoveCard={handleRemoveCard}
          commanderName={deck.commander}
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
