import { useState } from 'react';
import { Button, Drawer, Spin } from 'antd';
import { MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import DeckGrid from '../../components/DeckGrid/DeckGrid';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import ExportDeckModal from '../../components/ExportDeckModal/ExportDeckModal';
import '../MainPage/MainPage.css';

export default function MyDecksPage({ 
  decks, 
  decksLoading,
  onDeleteDeck,
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen
}) {
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  const handleExport = (deck) => {
    setSelectedDeck(deck);
    setExportModalVisible(true);
  };

  return (
    <div className="main-page" id="my-decks-page">
      <div className="main-page__content">
        {decksLoading ? (
          <div className="main-page__loading">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#c4952a' }} spin />} />
            <p style={{ color: '#b8a88a', marginTop: 16 }}>Cargando tus mazos...</p>
          </div>
        ) : (
          <>
            <h1 style={{ marginBottom: '24px', fontSize: '2rem', borderBottom: '1px solid rgba(196, 149, 42, 0.2)', paddingBottom: '12px' }}>Mis Mazos</h1>
            <DeckGrid 
              decks={decks || []} 
              onDelete={onDeleteDeck} 
              onExport={handleExport}
            />
          </>
        )}
      </div>

      <ExportDeckModal
        visible={exportModalVisible}
        deck={selectedDeck}
        onCancel={() => {
          setExportModalVisible(false);
          setSelectedDeck(null);
        }}
      />

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
