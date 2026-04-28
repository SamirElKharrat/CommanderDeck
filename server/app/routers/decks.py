from fastapi import APIRouter, Depends, HTTPException
from typing import List, Union
import aiosqlite
import json

from ..core.database import get_db
from ..schemas.deck import DeckCreate, DeckOut, DeckUpdate, CardItem
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/decks", tags=["decks"])

@router.get("", response_model=List[DeckOut])
async def list_decks(
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE user_id = ?", (current_user['id'],))
    decks = await cursor.fetchall()
    return [dict(deck) for deck in decks]

@router.get("/{deck_id}", response_model=DeckOut)
async def get_deck(
    deck_id: int,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE id = ? AND user_id = ?", (deck_id, current_user['id']))
    deck = await cursor.fetchone()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return dict(deck)

@router.post("", response_model=DeckOut)
async def create_deck(
    deck_in: DeckCreate,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    # Convertir lista de cartas a JSON string para SQLite
    cards_json = json.dumps([card.model_dump() for card in deck_in.cards])
    
    cursor = await db.execute(
        "INSERT INTO decks (user_id, deck_name, type, bracket, partner, cards) VALUES (?, ?, ?, ?, ?, ?)",
        (current_user['id'], deck_in.deck_name, deck_in.type, deck_in.bracket, deck_in.partner, cards_json)
    )
    deck_id = cursor.lastrowid
    await db.commit()
    
    cursor = await db.execute("SELECT * FROM decks WHERE id = ?", (deck_id,))
    new_deck = await cursor.fetchone()
    return dict(new_deck)

@router.post("/add-card", response_model=DeckOut)
async def add_card_to_deck(
    deck_id: int,
    card_data: Union[CardItem, List[CardItem]],
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE id = ? AND user_id = ?", (deck_id, current_user['id']))
    deck = await cursor.fetchone()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    # Convertir el string JSON de la base de datos a una lista de Python
    current_cards = json.loads(deck['cards'])
    
    # Normalizar: si es una sola carta, convertirla en lista para el bucle
    new_cards_list = [card_data] if isinstance(card_data, CardItem) else card_data
    
    # Añadir las nuevas cartas
    for card in new_cards_list:
        current_cards.append(card.model_dump())
    
    deck_in = DeckUpdate(
        cards=current_cards
    )
    return await update_deck(deck_id, deck_in, current_user, db)

@router.put("/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: int,
    deck_in: DeckUpdate,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    # Verificar que el mazo existe y pertenece al usuario
    cursor = await db.execute("SELECT id FROM decks WHERE id = ? AND user_id = ?", (deck_id, current_user['id']))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Deck not found")
    
    update_data = deck_in.model_dump(exclude_unset=True)
    if not update_data:
        cursor = await db.execute("SELECT * FROM decks WHERE id = ?", (deck_id,))
        deck = await cursor.fetchone()
        return dict(deck)
    
    query = "UPDATE decks SET "
    params = []
    for key, value in update_data.items():
        if key == 'cards' and value is not None:
            value = json.dumps(value)
        query += f"{key} = ?, "
        params.append(value)
    
    query = query.rstrip(", ") + " WHERE id = ?"
    params.append(deck_id)
    
    await db.execute(query, tuple(params))
    await db.commit()
    
    cursor = await db.execute("SELECT * FROM decks WHERE id = ?", (deck_id,))
    updated_deck = await cursor.fetchone()
    return dict(updated_deck)

@router.delete("/{deck_id}")
async def delete_deck(
    deck_id: int,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM decks WHERE id = ? AND user_id = ?", (deck_id, current_user['id']))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Deck not found")
    
    await db.execute("DELETE FROM decks WHERE id = ?", (deck_id,))
    await db.commit()
    return {"message": "Deck deleted successfully"}
