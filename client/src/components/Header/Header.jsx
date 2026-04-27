import { Button, Tooltip } from 'antd';
import { PlusOutlined, CrownOutlined, RobotOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header({ onCreateDeck, isChatOpen, onToggleChat }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMainPage = location.pathname === '/';

  return (
    <header className="app-header" id="app-header">
      <div
        className="app-header__brand"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
      >
        <CrownOutlined className="app-header__icon" />
        <h1 className="app-header__title">
          Commander<span className="app-header__title-accent">Deck</span>
        </h1>
      </div>

      <div className="app-header__actions">
        <Tooltip title={isChatOpen ? "Cerrar Asistente" : "Abrir Asistente"}>
          <Button
            type="text"
            icon={<RobotOutlined />}
            onClick={onToggleChat}
            className={`app-header__chat-toggle ${isChatOpen ? 'active' : ''}`}
            style={{ color: isChatOpen ? '#d4a537' : '#8b8fa6', fontSize: '20px' }}
          />
        </Tooltip>
        
        {isMainPage && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="app-header__create-btn"
            onClick={onCreateDeck}
            id="create-deck-btn"
          >
            Crear Mazo
          </Button>
        )}
      </div>
    </header>
  );
}
