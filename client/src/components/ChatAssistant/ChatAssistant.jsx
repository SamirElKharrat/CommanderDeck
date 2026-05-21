import { useState, useRef, useEffect } from 'react';
import { Input, Button, Popover } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import './ChatAssistant.css';

const { TextArea } = Input;

export default function ChatAssistant({ 
  context = '', 
  className = '',
  messages = [],
  isTyping = false,
  onSendMessage
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? 'auto' : 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Force scroll to bottom on mount
    const timer = setTimeout(() => {
      scrollToBottom(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim() || !onSendMessage) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatContent = (content) => {
    return content.split('\n').map((line, i) => {
      // Split by **text** or [[text]]
      const parts = line.split(/(\*\*.*?\*\*|\[\[.*?\]\])/g);
      return (
        <div key={i} style={{ minHeight: '1em' }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('[[') && part.endsWith(']]')) {
              const cardName = part.slice(2, -2);
              return (
                <Popover
                  key={j}
                  content={<img src={`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&format=image&version=normal`} alt={cardName} style={{ width: 200, borderRadius: 10 }} onError={(e) => { e.target.style.display = 'none'; }} />}
                  trigger="hover"
                  placement="right"
                  overlayInnerStyle={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
                >
                  <span style={{ color: '#c4952a', cursor: 'pointer', textDecoration: 'underline' }}>{cardName}</span>
                </Popover>
              );
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`chat-assistant ${className}`} id="chat-assistant">
      <div className="chat-assistant__header">
        <RobotOutlined className="chat-assistant__header-icon" />
        <h3 className="chat-assistant__header-title">Asistente IA</h3>
        <span className="chat-assistant__header-dot" />
      </div>

      <div className="chat-assistant__messages" id="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message chat-message--${msg.role}`}
          >
            <div>{formatContent(msg.content)}</div>
            <div className="chat-message__time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-assistant__typing">
            <span className="chat-assistant__typing-dot" />
            <span className="chat-assistant__typing-dot" />
            <span className="chat-assistant__typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-assistant__input-area">
        <TextArea
          ref={inputRef}
          placeholder={context ? `Pregunta sobre ${context}...` : 'Escribe tu pregunta...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoSize={{ minRows: 1, maxRows: 4 }}
          id="chat-input"
          style={{ resize: 'none' }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="chat-assistant__send-btn"
          id="chat-send-btn"
        />
      </div>
    </div>
  );
}
