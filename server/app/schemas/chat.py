from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    prompt: str
    deck_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    thread_id: str
