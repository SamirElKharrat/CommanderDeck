from fastapi import APIRouter, Depends
from ..schemas.chat import ChatRequest, ChatResponse
from ..dependencies import get_current_user
import aiosqlite
from typing import Optional

# Importamos lo necesario del RAG
# Nota: Podríamos necesitar ajustar las rutas de importación si ejecutamos desde server/
from rag.retriever import crear_embeddings, CHROMA_DIR
from langchain_chroma import Chroma

router = APIRouter(prefix="/api/chat", tags=["chat"])


def get_thread_id(user: aiosqlite.Row, deck_id: Optional[int] = None) -> str:
    """Genera un thread_id único por usuario y deck"""
    if deck_id:
        return f"user_{user['id']}_deck_{deck_id}"
    return f"user_{user['id']}_{user['user_name']}"

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    deck_id: Optional[int] = None,
    current_user: aiosqlite.Row = Depends(get_current_user)
):
    from Agents.agent import process_prompt
    
    thread_id = get_thread_id(current_user, deck_id)
    response = await process_prompt(request.prompt, thread_id)
    return ChatResponse(response=response, thread_id=thread_id)