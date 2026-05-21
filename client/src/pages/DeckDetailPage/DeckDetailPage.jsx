import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Divider, Drawer, Tooltip, message, Spin } from 'antd';
import { ArrowLeftOutlined, MessageOutlined, FileTextOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import CardList from '../../components/CardList/CardList';
import ExportDeckModal from '../../components/ExportDeckModal/ExportDeckModal';
import { updateDeck as apiUpdateDeck, removeCardFromDeck } from '../../api/decks';
import { transformDeck } from '../../utils/deckUtils';
import './DeckDetailPage.css';

export default function DeckDetailPage({ 
  user,
  decks, 
  onUpdateDeck,
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen,
  setActiveDeckId,
  onRefreshDecks,
  onCopy
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const localDeck = useMemo(() => decks.find((d) => String(d.id) === String(id)), [decks, id]);
  const [deck, setDeck] = useState(localDeck);
  const [loading, setLoading] = useState(!localDeck);

  const [editName, setEditName] = useState('');
  const [localCards, setLocalCards] = useState([]);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    if (id && setActiveDeckId) {
      setActiveDeckId(parseInt(id));
    }
    return () => {
      if (setActiveDeckId) setActiveDeckId(null);
    };
  }, [id, setActiveDeckId]);

  useEffect(() => {
    const loadDeck = async () => {
      if (localDeck) {
        setDeck(localDeck);
        setEditName(localDeck.name);
        setLocalCards(localDeck.cards);
        setLoading(false);
      } else {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:8000/api/decks/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!res.ok) throw new Error("Deck no encontrado");
          const rawDeck = await res.json();
          const tDeck = await transformDeck(rawDeck);
          setDeck(tDeck);
          setEditName(tDeck.name);
          setLocalCards(tDeck.cards);
        } catch (err) {
          message.error("Error al cargar el mazo: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    loadDeck();
  }, [localDeck, id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: 40 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#c4952a' }} spin />} />
      </div>
    );
  }

  if (!deck) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8b8fa6' }}>
        <h2>Mazo no encontrado</h2>
        <Button type="primary" onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  const isOwner = user && deck.owner_username === user.user_name;

  const handleRemoveCard = async (cardId, quantity = 1) => {
    if (!isOwner) return;
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
    if (!isOwner) return;
    try {
      await apiUpdateDeck(deck.id, { deck_name: editName.replace(' Deck', '') });
      if (onUpdateDeck) onUpdateDeck(deck.id, { name: editName });
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
            onClick={() => navigate(-1)}
            id="back-to-main"
          >
            Volver
          </Button>
        </div>

        {/* Deck header */}
        <div className="deck-detail__header">
          <img
            className="deck-detail__commander-img"
            src={deck.commanderImage}
            alt={deck.commander}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/180x180/1a1710/c4952a?text=Commander';
            }}
          />
          <div className="deck-detail__info">
            {isOwner ? (
              <Input
                className="deck-detail__edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveName}
                onPressEnter={handleSaveName}
                size="large"
                style={{ fontFamily: "'MedievalSharp', serif", fontSize: 26, fontWeight: 700 }}
                id="edit-deck-name"
              />
            ) : (
              <h1 style={{ fontFamily: "'MedievalSharp', serif", fontSize: 26, fontWeight: 700, color: '#e8dcc4', margin: 0, marginBottom: '8px' }}>
                {deck.name}
              </h1>
            )}
            
            <p className="deck-detail__commander-name">
              {deck.commander} {deck.owner_username && !isOwner && <span style={{ color: '#c4952a', marginLeft: '8px', fontSize: '14px' }}>por @{deck.owner_username}</span>}
            </p>

            <div className="deck-detail__meta-row">
              <span className="deck-detail__bracket-tag" style={{ background: 'rgba(196, 149, 42, 0.1)', color: '#c4952a', padding: '4px 12px', borderRadius: '4px', border: '1px solid rgba(196, 149, 42, 0.3)', fontWeight: 600 }}>
                Bracket {deck.bracket}
              </span>

              <span className="deck-detail__card-count" style={{ color: '#b8a88a' }}>
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

              {!isOwner && (
                <Button 
                  icon={<CopyOutlined />} 
                  type="primary"
                  onClick={() => onCopy && onCopy(deck)}
                  style={{ marginLeft: '8px' }}
                >
                  Copiar Mazo
                </Button>
              )}
            </div>

            {isOwner && (
              <div className="deck-detail__chat-hint">
                <span>💡 Usa el chat para añadir/quitar cartas o cambiar el bracket</span>
              </div>
            )}
          </div>
        </div>

        <ExportDeckModal
          visible={exportModalVisible}
          deck={deck}
          onCancel={() => setExportModalVisible(false)}
        />

        <Divider className="deck-detail__divider" style={{ borderColor: 'rgba(196, 149, 42, 0.2)' }} />

        {/* Cards section */}
        <h2 className="deck-detail__section-title" style={{ fontFamily: "'MedievalSharp', serif", color: '#e8dcc4' }}>Cartas del Mazo</h2>
        <CardList
          cards={localCards}
          isEditMode={isOwner}
          onRemoveCard={handleRemoveCard}
          commanderName={deck.commander}
        />
      </div>

      {isOwner && (
        <>
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
            styles={{ body: { padding: 0, height: '100%', background: '#12100d' } }}
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
        </>
      )}
    </div>
  );
}
