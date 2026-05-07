import { Button, Drawer, Spin } from 'antd';
import { MessageOutlined, LoadingOutlined } from '@ant-design/icons';
import DeckGrid from '../../components/DeckGrid/DeckGrid';
import ChatAssistant from '../../components/ChatAssistant/ChatAssistant';
import './MainPage.css';

export default function MainPage({ 
  decks, 
  decksLoading,
  onDeleteDeck,
  chatMessages,
  isChatTyping,
  onSendMessage,
  isChatOpen,
  setIsChatOpen
}) {
  return (
    <div className="main-page" id="main-page">
      <div className="main-page__content">
        {decksLoading ? (
          <div className="main-page__loading">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#d4a537' }} spin />} />
            <p style={{ color: '#5d6080', marginTop: 16 }}>Cargando tus mazos...</p>
          </div>
        ) : (
          <DeckGrid decks={decks || []} onDelete={onDeleteDeck} />
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
        styles={{ body: { padding: 0, height: '100%' } }}
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
