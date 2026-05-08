# CommanderDeck

Una aplicación web completa para crear y gestionar mazos de Magic: The Gathering en el formato Commander, integrada con inteligencia artificial para proporcionar recomendaciones personalizadas y asistencia inteligente en la construcción de mazos.

## 🎯 Problema que Resuelve

CommanderDeck soluciona varios problemas clave para los jugadores de Magic: The Gathering:

- **Complejidad en la construcción de mazos**: El formato Commander requiere 100 cartas específicas con reglas complejas de construcción
- **Falta de herramientas centralizadas**: Los jugadores necesitan acceder a múltiples fuentes para obtener información de cartas, sinergias y precios
- **Dificultad para optimizar mazos**: No existe una guía inteligente que sugiera mejoras basadas en el commander y presupuesto
- **Gestión manual de colecciones**: Los jugadores pierden tiempo organizando y trackeando sus mazos físicamente

## 🤖 Integración de Inteligencia Artificial

El sistema incorpora un agente de IA avanzado que funciona como asistente personal para la construcción de mazos:

### Arquitectura del Agente

- **Motor principal**: LangChain con LangGraph para orquestación de herramientas y manejo de conversaciones
- **Modelo de lenguaje**: Ollama con Gemma4 para procesamiento de lenguaje natural en español
- **Persistencia**: SQLite con LangGraph checkpoint para mantener contexto conversacional
- **Herramientas especializadas**: 5 herramientas personalizadas para gestión de mazos

### Herramientas del Agente

1. **`get_commander_deck`**: Obtiene mazos promedio de EDHRec y los almacena en ChromaDB
2. **`add_cards`**: Agrega cartas a mazos existentes con validación y detalles
3. **`remove_cards`**: Elimina cartas de mazos con gestión de cantidades
4. **`deck_info`**: Consulta información detallada de mazos
5. **`update_deck`**: Actualiza metadatos del mazo (bracket/presupuesto)

## 🏗️ Arquitectura General

### Componentes Principales

```
┌─────────────────┐    ┌─────────────────┐    
│   Frontend      │    │   Backend API    │   
│   (React)       │◄──►│   (FastAPI)      │
└─────────────────┘    └─────────────────┘    
         │                       │                       
         │                       │                      
         ▼                       ▼                      
┌─────────────────┐    ┌─────────────────┐    
│   Ant Design    │    │   SQLite DB     │    
│   UI Components │    │   (Usuarios/    │    
│                 │    │    Mazos)       │    
└─────────────────┘    └─────────────────┘    
```

### Frontend (React + Vite)
- **Framework**: React 19.2.5 con Vite
- **UI Library**: Ant Design 6.3.7
- **Routing**: React Router DOM 7.14.2
- **Estado**: React hooks y contexto
- **Estilos**: CSS Modules + Ant Design Theme

### Backend API (FastAPI)
- **Framework**: FastAPI con async/await
- **Base de Datos**: SQLite con aiosqlite
- **Autenticación**: JWT tokens con python-jose
- **Validación**: Pydantic schemas
- **CORS**: Configurado para desarrollo local

### Agente de IA (LangChain)
- **Orquestación**: LangGraph con checkpoint SQLite
- **Modelo**: Ollama + Gemma4
- **Tools**: 5 herramientas personalizadas
- **Integraciones**: EDHRec API, MCP Client
- **Persistencia**: Conversacional con threading


## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.2.5**: Framework de JavaScript
- **Vite 8.0.10**: Build tool y development server
- **Ant Design 6.3.7**: Biblioteca de componentes UI
- **React Router DOM 7.14.2**: Enrutamiento client-side
- **ESLint**: Linting de código

### Backend
- **FastAPI**: Framework web moderno asíncrono
- **SQLite**: Base de datos ligera
- **aiosqlite**: Driver asíncrono para SQLite
- **python-jose**: Manejo de tokens JWT
- **bcrypt**: Hashing de contraseñas
- **Pydantic**: Validación de datos

### Inteligencia Artificial
- **LangChain**: Framework para desarrollo de aplicaciones LLM
- **LangGraph**: Orquestación de agentes con estado
- **Ollama**: Runtime para modelos de lenguaje locales
- **EDHRec**: API de datos de Magic: The Gathering
- **MCP**: Model Context Protocol para integraciones

### Desarrollo
- **Python 3.13**: Lenguaje principal del backend
- **Node.js**: Runtime para frontend
- **Git**: Control de versiones

## 🚀 Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Python 3.13+
- Node.js 18+
- Ollama instalado y corriendo
- Modelo Gemma4 descargado en Ollama

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd CommanderDeck
```

### 2. Configurar Backend
```bash
# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual (Windows)
.venv\Scripts\activate

# Activar entorno virtual (Linux/Mac)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar Ollama
```bash
# Instalar Ollama (si no está instalado)
# Visitar: https://ollama.ai/

# Descargar modelo Gemma4
ollama pull gemma4:26b

# Iniciar Ollama server
ollama serve
```

### 4. Iniciar Backend
```bash
# Desde la raíz del proyecto
cd server

# Iniciar servidor FastAPI
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Configurar Frontend
```bash
# Nueva terminal
cd client

# Instalar dependencias
npm install
```

### 6. Iniciar Frontend
```bash
# Desde el directorio client
npm run dev
```

### 7. Acceder a la Aplicación
- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
- **API**: http://localhost:8000/api

## 📁 Estructura del Proyecto

```
CommanderDeck/
├── Agents/                 # Agente de IA y herramientas
│   ├── agent.py           # Agente principal con LangChain
│   └── ...                # Utilidades del agente
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── api/           # Clientes API
│   │   └── theme/         # Configuración de temas
│   ├── package.json       # Dependencias del frontend
│   └── vite.config.js     # Configuración de Vite
├── server/                # Backend FastAPI
│   ├── app/
│   │   ├── core/          # Configuración central
│   │   ├── routers/       # Endpoints API
│   │   ├── schemas/       # Modelos Pydantic
│   │   └── main.py        # Aplicación principal
│   └── commander_deck.db  # Base de datos SQLite
├── requirements.txt       # Dependencias Python
├── package.json          # Metadatos del proyecto
└── .env                  # Variables de entorno
```

## 🎮 Características Principales

### Gestión de Mazos
- Creación de mazos Commander desde cero
- Importación de mazos promedio de EDHRec
- Edición intuitiva con drag & drop
- Validación automática de reglas Commander

### Asistente IA
- Conversación natural
- Recomendaciones personalizadas
- Análisis de sinergias entre cartas
- Optimización por presupuesto

### Interfaz Usuario
- Diseño moderno con Ant Design
- Responsive para móviles y desktop
- Navegación intuitiva
- Visualización de cartas con imágenes

