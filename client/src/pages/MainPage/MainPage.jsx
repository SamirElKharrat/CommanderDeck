import { useState } from 'react';
import { Button, Drawer } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import DeckGrid from '../../components/DeckGrid/DeckGrid';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import './MainPage.css';

export default function MainPage({ 
  decks, 
  onDeleteDeck,
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen
}) {
  // We use the global isChatOpen for both desktop panel and mobile drawer
  // But strictly for mobile, it behaves like a Drawer.
  // On desktop, it slides the panel.

  return (
    <div className="main-page" id="main-page">
      <div className="main-page__content">
        <DeckGrid decks={decks} onDelete={onDeleteDeck} />
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
        styles={{ body: { padding: 0, height: '100%' } }}
        id="mobile-chat-drawer"
        className="mobile-only-drawer" // Ensure this only affects mobile behavior
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
