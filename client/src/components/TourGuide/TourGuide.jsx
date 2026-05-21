import React, { useEffect, useRef } from 'react';
import { ShepherdJourneyProvider, useShepherd } from 'react-shepherd';
import 'shepherd.js/dist/css/shepherd.css';
import './TourGuide.css';

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'custom-shepherd-theme',
    scrollTo: { behavior: 'smooth', block: 'center' }
  },
  useModalOverlay: true
};

const steps = [
  {
    id: 'intro',
    title: '¡Bienvenido a CommanderDeck!',
    text: ['Aquí podrás crear, gestionar y explorar mazos de Commander usando Inteligencia Artificial.', '¡Vamos a dar un rápido paseo!'],
    attachTo: { element: '#app-header', on: 'bottom' },
    classes: 'intro-step',
    buttons: [
      {
        classes: 'shepherd-button-secondary',
        text: 'Saltar',
        action() { return this.cancel(); }
      },
      {
        classes: 'shepherd-button-primary',
        text: 'Siguiente',
        action() { return this.next(); }
      }
    ]
  },
  {
    id: 'create-deck',
    title: 'Creación de Mazos',
    text: ['Haz clic aquí para crear un mazo estándar usando EDHRec o un mazo experimental guiado totalmente por la IA.'],
    attachTo: { element: '#create-deck-btn', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button-secondary',
        text: 'Atrás',
        action() { return this.back(); }
      },
      {
        classes: 'shepherd-button-primary',
        text: 'Siguiente',
        action() { return this.next(); }
      }
    ]
  },
  {
    id: 'chat-assistant',
    title: 'Asistente IA Integrado',
    text: ['Este es tu asistente personal. Puedes preguntarle dudas sobre reglas, pedirle recomendaciones de cartas o gestionar tus mazos directamente desde el chat.'],
    attachTo: { element: '#chat-toggle-btn', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button-secondary',
        text: 'Atrás',
        action() { return this.back(); }
      },
      {
        classes: 'shepherd-button-primary',
        text: 'Siguiente',
        action() { return this.next(); }
      }
    ]
  },
  {
    id: 'user-menu',
    title: 'Tu Colección',
    text: ['Accede a tu perfil y revisa tus mazos guardados desde este menú.'],
    attachTo: { element: '#user-menu-btn', on: 'bottom' },
    buttons: [
      {
        classes: 'shepherd-button-secondary',
        text: 'Atrás',
        action() { return this.back(); }
      },
      {
        classes: 'shepherd-button-primary',
        text: 'Siguiente',
        action() { return this.next(); }
      }
    ]
  },
  {
    id: 'public-decks',
    title: 'Mazos Públicos',
    text: ['Por último, explora los mazos que otros jugadores han hecho públicos en la sección principal y cópialos a tu colección. ¡Disfruta de CommanderDeck!'],
    attachTo: { element: '#main-page', on: 'top' },
    buttons: [
      {
        classes: 'shepherd-button-secondary',
        text: 'Atrás',
        action() { return this.back(); }
      },
      {
        classes: 'shepherd-button-primary',
        text: 'Terminar',
        action() { return this.complete(); }
      }
    ]
  }
];

function TourInstance({ isReady }) {
  const Shepherd = useShepherd();
  const tourRef = useRef(null);

  useEffect(() => {
    if (!isReady || !Shepherd) return;
    
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    
    if (!tourRef.current) {
      tourRef.current = new Shepherd.Tour(tourOptions);
      tourRef.current.addSteps(steps);
      
      tourRef.current.on('complete', () => {
        localStorage.setItem('hasSeenTour', 'true');
      });
      tourRef.current.on('cancel', () => {
        localStorage.setItem('hasSeenTour', 'true');
      });
    }
    
    // Ensure all elements exist before starting
    const checkElements = () => {
      if (document.getElementById('create-deck-btn') && document.getElementById('chat-toggle-btn') && document.getElementById('main-page')) {
        if (!tourRef.current.isActive()) {
          tourRef.current.start();
        }
      } else {
        setTimeout(checkElements, 500);
      }
    };

    if (!hasSeenTour) {
      setTimeout(checkElements, 1000); // Slight delay for UI to settle
    }
  }, [Shepherd, isReady]);

  return null;
}

export default function TourGuide({ children, isReady }) {
  return (
    <ShepherdJourneyProvider>
      <TourInstance isReady={isReady} />
      {children}
    </ShepherdJourneyProvider>
  );
}
