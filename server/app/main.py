import sys
import os

# Añadir el directorio raíz al path para poder importar 'rag'
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import init_db
from .routers import auth, users, decks, chat
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar base de datos
    await init_db()
    yield
    # Cleanup si fuera necesario

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(decks.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "Welcome to CommanderDeck API", "docs": "/docs"}
