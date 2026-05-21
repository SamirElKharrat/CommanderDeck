import { Button, Tooltip, Dropdown } from 'antd';
import { PlusOutlined, CrownOutlined, RobotOutlined, UserOutlined, LogoutOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header({ user, onCreateDeck, isChatOpen, onToggleChat, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <span style={{ color: '#e8dcc4', fontWeight: 600 }}>
          {user?.user_name || 'Usuario'}
        </span>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'my-decks',
      label: 'Mis Mazos',
      icon: <UnorderedListOutlined />,
      onClick: () => navigate('/my-decks'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Cerrar sesión',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: onLogout,
    },
  ];

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
            style={{ color: isChatOpen ? '#c4952a' : '#b8a88a', fontSize: '20px' }}
            id="chat-toggle-btn"
          />
        </Tooltip>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="app-header__create-btn"
          onClick={onCreateDeck}
          id="create-deck-btn"
        >
          Crear Mazo
        </Button>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Button
            type="text"
            className="app-header__user-btn"
            icon={<UserOutlined />}
            id="user-menu-btn"
          >
            <span className="app-header__user-name">{user?.user_name}</span>
          </Button>
        </Dropdown>
      </div>
    </header>
  );
}

