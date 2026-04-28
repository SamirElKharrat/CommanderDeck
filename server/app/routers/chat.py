from fastapi import APIRouter, Depends
from ..schemas.chat import ChatRequest, ChatResponse
from ..dependencies import get_current_user
import aiosqlite

# Importamos lo necesario del RAG
# Nota: Podríamos necesitar ajustar las rutas de importación si ejecutamos desde server/
from rag.retriever import crear_embeddings, CHROMA_DIR
from langchain_chroma import Chroma

router = APIRouter(prefix="/api/chat", tags=["chat"])


