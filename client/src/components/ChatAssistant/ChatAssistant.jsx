import { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import './ChatAssistant.css';

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

  // Convert markdown-like bold to simple strong tags for the recommendations
  const formatContent = (content) => {
    return content.split('\n').map((line, i) => {
      // Very basic markdown bold parsing for the AI responses
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} style={{ minHeight: '1em' }}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
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
        <Input
          ref={inputRef}
          placeholder={context ? `Pregunta sobre ${context}...` : 'Escribe tu pregunta...'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          id="chat-input"
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
