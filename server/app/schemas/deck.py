from pydantic import BaseModel, ConfigDict, field_validator
import json
from typing import List, Optional
from datetime import datetime

class CardItem(BaseModel):
    name: str
    quantity: int
    details: str
    type: str
    mana_cost: Optional[str] = ""
    version: Optional[str] = ""

class DeckBase(BaseModel):
    deck_name: str
    type: str = "commander"
    bracket: Optional[str] = ""
    partner: int = 0
    cards: List[CardItem] = []
    is_public: bool = False

class DeckCreate(DeckBase):
    pass

class DeckUpdate(BaseModel):
    deck_name: Optional[str] = None
    type: Optional[str] = None
    bracket: Optional[str] = None   
    partner: Optional[int] = None
    cards: Optional[List[CardItem]] = None
    is_public: Optional[bool] = None

class DeckCopyRequest(BaseModel):
    is_public: bool = False

class DeckVisibilityUpdate(BaseModel):
    is_public: bool

class DeckOut(DeckBase):
    id: int
    user_id: int
    created_at: datetime
    owner_username: Optional[str] = ""
    original_deck_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator('cards', mode='before')
    @classmethod
    def parse_cards(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v
