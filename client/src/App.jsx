import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { message, Spin } from 'antd';
import Header from './components/Header/Header';
import CreateDeckModal from './components/CreateDeckModal/CreateDeckModal';
import MainPage from './pages/MainPage/MainPage';
import DeckDetailPage from './pages/DeckDetailPage/DeckDetailPage';
import AuthPage from './pages/AuthPage/AuthPage';
import { isAuthenticated, fetchCurrentUser, logoutUser } from './api/auth';
import { fetchDecks, deleteDeck as apiDeleteDeck, toggleDeckVisibility, copyDeck } from './api/decks';
import { sendChatMessage } from './api/chat';
import MyDecksPage from './pages/MyDecksPage/MyDecksPage';
import CopyDeckModal from './components/CopyDeckModal/CopyDeckModal';
import './App.css';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Deck state
  const [decks, setDecks] = useState([]);
  const [decksLoading, setDecksLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [deckToCopy, setDeckToCopy] = useState(null);
  const [copyingDeck, setCopyingDeck] = useState(false);

  // Global Chat State
  const WELCOME_MSG = {
    id: 'msg-welcome',
    role: 'assistant',
    content: '¡Hola! Soy tu asistente de **CommanderDeck**. Puedo ayudarte a:\n\n• **Crear mazos** — Dime el comandante y presupuesto\n• **Añadir cartas** — Dime qué cartas agregar y a qué mazo\n• **Quitar cartas** — Dime qué cartas remover\n• **Consultar tu mazo** — Pregúntame sobre un mazo\n• **Actualizar bracket** — Cambia el bracket de tu mazo\n\n¿En qué puedo ayudarte?',
    timestamp: new Date().toISOString(),
  };

  const [chatHistories, setChatHistories] = useState({ main: [WELCOME_MSG] });
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activeDeckId, setActiveDeckId] = useState(null);

  const currentChatKey = activeDeckId ? `deck-${activeDeckId}` : 'main';
  const chatMessages = chatHistories[currentChatKey] || [WELCOME_MSG];

  // ── Auth check on mount ──
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await fetchCurrentUser();
          setUser(userData);
        } catch {
          logoutUser();
        }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  // ── Load decks when authenticated ──
  const loadDecks = useCallback(async () => {
    if (!user) return;
    setDecksLoading(true);
    try {
      const data = await fetchDecks();
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
          name: deck.deck_name,
          commander: commanderName,
          commanderImage: `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(commanderName)}&format=image&version=art_crop`,
          bracket: deck.bracket || '2',
          type: deck.type,
          partner: deck.partner,
          is_public: deck.is_public === 1,
          owner_username: deck.owner_username,
          cardCount: cards.reduce((sum, c) => sum + (parseInt(c.quantity) || 1), 0),
          cards: cards.map((c, idx) => ({
            id: `card-${deck.id}-${idx}`,
            name: c.name,
            quantity: parseInt(c.quantity) || 1,
            type: c.type || '',
            details: c.details || '',
            manaCost: c.mana_cost || '',
            image: c.version || `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(c.name)}&format=image&version=normal`,
            version: c.version || '',
          })),
          colors: colors,
          created_at: deck.created_at,
        };
      }));
      setDecks(transformed);
    } catch (err) {
      message.error(err.message);
    } finally {
      setDecksLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // ── Auth handlers ──
  const handleAuthSuccess = async () => {
    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch {
      message.error('Error al obtener usuario');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setDecks([]);
    setChatHistories({ main: [WELCOME_MSG] });
  };

  const [creatingDeck, setCreatingDeck] = useState(false);
  const navigate = useNavigate();

  // ── Chat handler (real API) ──
  const handleSendMessage = async (text, skipRefresh = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setChatHistories((prev) => ({
      ...prev,
      [currentChatKey]: [...(prev[currentChatKey] || [WELCOME_MSG]), userMsg]
    }));
    setIsChatTyping(true);
    setIsChatOpen(true);

    try {
      const result = await sendChatMessage(trimmed, activeDeckId);

      const assistantMsg = {
        id: `msg-${Date.now()}-reply`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      };
      setChatHistories((prev) => ({
        ...prev,
        [currentChatKey]: [...(prev[currentChatKey] || [WELCOME_MSG]), assistantMsg]
      }));

      if (!skipRefresh) {
        await loadDecks();
      }
      return result;
    } catch (err) {
      const errorMsg = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `⚠️ Error: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setChatHistories((prev) => ({
        ...prev,
        [currentChatKey]: [...(prev[currentChatKey] || [WELCOME_MSG]), errorMsg]
      }));
      throw err;
    } finally {
      setIsChatTyping(false);
    }
  };

  // ── Deck handlers ──
  const handleCreateDeck = async (values) => {
    setCreatingDeck(true);
    try {
      const currentDecks = [...decks];

      // Send command to AI agent
      // Note: we can map values.isExperimental to the new mtg-commander-deck tool if checked
      let prompt = '';
      if (values.isExperimental) {
        prompt = `Crea un mazo experimental usando mtg-commander-deck con el comandante "${values.commander}" en el bracket ${values.bracket || '2'}`;
      } else {
        prompt = `Crea un mazo de Commander con el comandante "${values.commander}" con presupuesto ${values.budget || 'budget'}`;
      }
      
      await sendChatMessage(prompt);

      setDecksLoading(true);
      await loadDecks();

      const transformed = await fetchDecks(); // need an updated way to find new deck, but loadDecks updates state
      
      message.success('Mazo creado/procesado');
      setModalOpen(false);
    } catch (err) {
      message.error('Error al crear el mazo: ' + err.message);
    } finally {
      setCreatingDeck(false);
    }
  };

  const handleDeleteDeck = async (id) => {
    try {
      await apiDeleteDeck(id);
      setDecks((prev) => prev.filter((d) => d.id !== id));
      message.success('Mazo eliminado');
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleUpdateDeck = (id, updates) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handleToggleVisibility = async (deck, isPublic) => {
    try {
      await toggleDeckVisibility(deck.id, isPublic);
      handleUpdateDeck(deck.id, { is_public: isPublic });
      message.success(`El mazo ahora es ${isPublic ? 'público' : 'privado'}`);
    } catch (err) {
      message.error(err.message);
    }
  };

  const openCopyModal = (deck) => {
    setDeckToCopy(deck);
    setCopyModalOpen(true);
  };

  const submitCopyDeck = async (deckId, isPublic) => {
    setCopyingDeck(true);
    try {
      const newDeckRaw = await copyDeck(deckId, isPublic);
      message.success('Mazo copiado a tu colección');
      setCopyModalOpen(false);
      setDeckToCopy(null);
      await loadDecks();
      navigate(`/deck/${newDeckRaw.id}`);
    } catch (err) {
      message.error(err.message);
    } finally {
      setCopyingDeck(false);
    }
  };

  // ── Loading state ──
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#12100d' }}>
        <Spin size="large" />
      </div>
    );
  }

  // ── Not authenticated ──
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        onCreateDeck={() => setModalOpen(true)}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onLogout={handleLogout}
      />

      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <MainPage
                chatMessages={chatMessages}
                isChatTyping={isChatTyping}
                onSendMessage={handleSendMessage}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                onCopy={openCopyModal}
              />
            }
          />
          <Route
            path="/my-decks"
            element={
              <MyDecksPage
                decks={decks}
                decksLoading={decksLoading}
                onDeleteDeck={handleDeleteDeck}
                chatMessages={chatMessages}
                isChatTyping={isChatTyping}
                onSendMessage={handleSendMessage}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                onToggleVisibility={handleToggleVisibility}
                onCopy={openCopyModal}
              />
            }
          />
          <Route
            path="/deck/:id"
            element={
              <DeckDetailPage
                user={user}
                decks={decks}
                onUpdateDeck={handleUpdateDeck}
                chatMessages={chatMessages}
                isChatTyping={isChatTyping}
                onSendMessage={handleSendMessage}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                setActiveDeckId={setActiveDeckId}
                onRefreshDecks={loadDecks}
                onCopy={openCopyModal}
              />
            }
          />
        </Routes>
      </div>

      <CreateDeckModal
        open={modalOpen}
        loading={creatingDeck}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateDeck}
      />

      <CopyDeckModal
        visible={copyModalOpen}
        deck={deckToCopy}
        loading={copyingDeck}
        onCancel={() => {
          setCopyModalOpen(false);
          setDeckToCopy(null);
        }}
        onCopy={submitCopyDeck}
      />
    </div>
  );
}

export default App;
