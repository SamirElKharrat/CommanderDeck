import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MOCK_DECKS, INITIAL_CHAT_MESSAGES, ASSISTANT_RESPONSES, COMMANDER_RECOMMENDATIONS } from './data/mockData';
import Header from './components/Header/Header';
import CreateDeckModal from './components/CreateDeckModal/CreateDeckModal';
import MainPage from './pages/MainPage/MainPage';
import DeckDetailPage from './pages/DeckDetailPage/DeckDetailPage';
import './App.css';

const SCRYFALL_IMG = (name) =>
  `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&format=image&version=art_crop`;

function App() {
  const [decks, setDecks] = useState(MOCK_DECKS);
  const [modalOpen, setModalOpen] = useState(false);

  // Global Chat State
  const [chatMessages, setChatMessages] = useState([...INITIAL_CHAT_MESSAGES]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const handleSendMessage = (text, isRecommendation = false) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatTyping(true);
    setIsChatOpen(true); // Ensure chat is visible

    setTimeout(() => {
      const responseText = isRecommendation 
        ? COMMANDER_RECOMMENDATIONS 
        : ASSISTANT_RESPONSES[Math.floor(Math.random() * ASSISTANT_RESPONSES.length)];
      
      const assistantMsg = {
        id: `msg-${Date.now()}-reply`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
      setIsChatTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleCreateDeck = (values) => {
    const newDeck = {
      id: String(Date.now()),
      name: `${values.commander} Deck`,
      commander: values.commander,
      commanderImage: SCRYFALL_IMG(values.commander),
      budget: values.budget,
      bracket: 2, // Siempre bracket 2 como se pidió
      colors: ['W'], // Default color
      cardCount: 0,
      cards: [],
    };
    setDecks((prev) => [newDeck, ...prev]);
    setModalOpen(false);
  };

  const handleDeleteDeck = (id) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDeck = (id, updates) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  return (
    <div className="app-shell">
      <Header 
        onCreateDeck={() => setModalOpen(true)} 
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <MainPage 
                decks={decks} 
                onDeleteDeck={handleDeleteDeck}
                chatMessages={chatMessages}
                isChatTyping={isChatTyping}
                onSendMessage={handleSendMessage}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
              />
            }
          />
          <Route
            path="/deck/:id"
            element={
              <DeckDetailPage 
                decks={decks} 
                onUpdateDeck={handleUpdateDeck}
                chatMessages={chatMessages}
                isChatTyping={isChatTyping}
                onSendMessage={handleSendMessage}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
              />
            }
          />
        </Routes>
      </div>

      <CreateDeckModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateDeck}
        onRecommend={() => {
          setModalOpen(false);
          handleSendMessage('Dime los 10 mejores comandantes', true);
        }}
      />
    </div>
  );
}

export default App;
