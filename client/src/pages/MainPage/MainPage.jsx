import { useState, useEffect, useCallback } from 'react';
import { Button, Drawer, Spin, Input, Select, Space } from 'antd';
import { MessageOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import DeckGrid from '../../components/DeckGrid/DeckGrid';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import { fetchPublicDecks } from '../../api/decks';
import './MainPage.css';

const { Option } = Select;

export default function MainPage({ 
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen
}) {
  const [publicDecks, setPublicDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bracketFilter, setBracketFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadPublicDecks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPublicDecks({
        bracket: bracketFilter,
        search: searchQuery,
      });

      const transformed = await Promise.all(data.map(async (deck) => {
        const cards = typeof deck.cards === 'string' ? JSON.parse(deck.cards) : deck.cards;
        const commanderName = (deck.deck_name || "").trim();

        let colors = ['W'];
        try {
          const scryRes = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}`);
          if (scryRes.ok) {
            const scryData = await scryRes.json();
            colors = scryData.color_identity || ['C'];
          }
        } catch (e) {
          console.error("Error fetching commander colors", e);
        }

        return {
          id: deck.id,
          name: `${commanderName} Deck`,
          commander: commanderName,
          commanderImage: `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}&format=image&version=art_crop`,
          bracket: deck.bracket || '2',
          type: deck.type,
          partner: deck.partner,
          owner_username: deck.owner_username,
          cardCount: cards.reduce((sum, c) => sum + (parseInt(c.quantity) || 1), 0),
          colors: colors,
          created_at: deck.created_at,
          cards: cards
        };
      }));

      setPublicDecks(transformed);
    } catch (err) {
      console.error("Error fetching public decks:", err);
    } finally {
      setLoading(false);
    }
  }, [bracketFilter, searchQuery]);

  useEffect(() => {
    loadPublicDecks();
  }, [loadPublicDecks]);

  return (
    <div className="main-page" id="main-page">
      <div className="main-page__content">
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(196, 149, 42, 0.2)', paddingBottom: '12px' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Mazos Públicos</h1>
          
          <Space>
            <Input 
              placeholder="Buscar mazo..." 
              prefix={<SearchOutlined style={{ color: '#c4952a' }}/>}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={loadPublicDecks}
            />
            <Select 
              placeholder="Bracket" 
              value={bracketFilter || undefined}
              onChange={setBracketFilter}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="1">Bracket 1</Option>
              <Option value="2">Bracket 2</Option>
              <Option value="3">Bracket 3</Option>
              <Option value="4">Bracket 4</Option>
            </Select>
          </Space>
        </div>

        {loading ? (
          <div className="main-page__loading">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#c4952a' }} spin />} />
            <p style={{ color: '#b8a88a', marginTop: 16 }}>Cargando mazos públicos...</p>
          </div>
        ) : (
          <DeckGrid 
            decks={publicDecks} 
            isPublicView={true}
          />
        )}
      </div>

      {/* Desktop chat sidebar */}
      <div className={`main-page__chat-panel ${!isChatOpen ? 'main-page__chat-panel--closed' : ''}`}>
        <ChatAssistant 
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
        id="mobile-chat-toggle"
      />

      {/* Mobile chat drawer */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setIsChatOpen(false)}
        open={isChatOpen}
        width={340}
        styles={{ body: { padding: 0, height: '100%', background: '#12100d' } }}
        id="mobile-chat-drawer"
        className="mobile-only-drawer"
      >
        <ChatAssistant 
          messages={chatMessages}
          isTyping={isChatTyping}
          onSendMessage={onSendMessage}
          className="chat-assistant--drawer" 
        />
      </Drawer>
    </div>
  );
}
