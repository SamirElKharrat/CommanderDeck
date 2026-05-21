from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Union, Optional
import aiosqlite
import json

from ..core.database import get_db
from ..schemas.deck import DeckCreate, DeckOut, DeckUpdate, CardItem, DeckCopyRequest, DeckVisibilityUpdate
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/decks", tags=["decks"])

@router.get("/public", response_model=List[DeckOut])
async def list_public_decks(
    bracket: Optional[str] = None,
    search: Optional[str] = None,
    colors: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: aiosqlite.Connection = Depends(get_db)
):
    offset = (page - 1) * limit
    
    query = "SELECT * FROM decks WHERE is_public = 1"
    params = []
    
    if bracket:
        query += " AND bracket = ?"
        params.append(bracket)
    
    if search:
        query += " AND deck_name LIKE ?"
        params.append(f"%{search}%")
        
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor = await db.execute(query, tuple(params))
    decks = await cursor.fetchall()
    
    result_decks = [dict(deck) for deck in decks]
    
    if colors:
        required_colors = set(colors.split(","))
        filtered_decks = []
        for deck in result_decks:
            try:
                cards = json.loads(deck['cards'])
                deck_colors = set()
                for card in cards:
                    if 'mana_cost' in card and card['mana_cost']:
                        for c in "WUBRG":
                            if c in card['mana_cost']:
                                deck_colors.add(c)
                if required_colors.issubset(deck_colors):
                    filtered_decks.append(deck)
            except:
                pass
        return filtered_decks
        
    return result_decks

@router.get("", response_model=List[DeckOut])
async def list_decks(
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE user_id = ? ORDER BY created_at DESC", (current_user['id'],))
    decks = await cursor.fetchall()
    return [dict(deck) for deck in decks]

@router.get("/{deck_id}", response_model=DeckOut)
async def get_deck(
    deck_id: int,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE id = ? AND (user_id = ? OR is_public = 1)", (deck_id, current_user['id']))
    deck = await cursor.fetchone()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found or access denied")
    return dict(deck)

@router.post("", response_model=DeckOut)
async def create_deck(
    deck_in: DeckCreate,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cards_json = json.dumps([card.model_dump() for card in deck_in.cards])
    owner_username = current_user['user_name']
    
    cursor = await db.execute(
        "INSERT INTO decks (user_id, deck_name, type, bracket, partner, cards, is_public, owner_username) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (current_user['id'], deck_in.deck_name, deck_in.type, deck_in.bracket, deck_in.partner, cards_json, int(deck_in.is_public), owner_username)
    )
    deck_id = cursor.lastrowid
    await db.commit()
    
    cursor = await db.execute("SELECT * FROM decks WHERE id = ?", (deck_id,))
    new_deck = await cursor.fetchone()
    return dict(new_deck)

@router.post("/{deck_id}/copy", response_model=DeckOut)
async def copy_deck(
    deck_id: int,
    copy_req: DeckCopyRequest,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE id = ? AND (user_id = ? OR is_public = 1)", (deck_id, current_user['id']))
    original = await cursor.fetchone()
    
    if not original:
        raise HTTPException(status_code=404, detail="Deck not found or cannot be copied")
        
    owner_username = current_user['user_name']
    
    cursor = await db.execute(
        "INSERT INTO decks (user_id, deck_name, type, bracket, partner, cards, is_public, owner_username, original_deck_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (current_user['id'], f"Copy of {original['deck_name']}", original['type'], original['bracket'], original['partner'], original['cards'], int(copy_req.is_public), owner_username, original['id'])
    )
    new_id = cursor.lastrowid
    await db.commit()
    
    cursor = await db.execute("SELECT * FROM decks WHERE id = ?", (new_id,))
    new_deck = await cursor.fetchone()
    return dict(new_deck)

@router.patch("/{deck_id}/visibility", response_model=DeckOut)
async def update_deck_visibility(
    deck_id: int,
    visibility_req: DeckVisibilityUpdate,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT id FROM decks WHERE id = ? AND user_id = ?", (deck_id, current_user['id']))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Deck not found or you don't have permission")
        
    await db.execute("UPDATE decks SET is_public = ? WHERE id = ?", (int(visibility_req.is_public), deck_id))
    await db.commit()
    
    cursor = await db.execute("SELECT * FROM decks WHERE id = ?", (deck_id,))
    updated_deck = await cursor.fetchone()
    return dict(updated_deck)

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
    
    current_cards = json.loads(deck['cards'])
    new_cards_list = [card_data] if isinstance(card_data, CardItem) else card_data
    
    for card in new_cards_list:
        for current_card in current_cards:
            if current_card['name'] == card.name:
                current_card['quantity'] += card.quantity
                break
        else:
            current_cards.append(card.model_dump())

    deck_in = DeckUpdate(cards=current_cards)
    return await update_deck(deck_id, deck_in, current_user, db)

@router.post("/remove-card", response_model=DeckOut)
async def remove_card_from_deck(
    deck_id: int,
    card_name: str,
    quantity: int,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    cursor = await db.execute("SELECT * FROM decks WHERE id = ? AND user_id = ?", (deck_id, current_user['id']))
    deck = await cursor.fetchone()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    current_cards = json.loads(deck['cards'])
    for card in current_cards:
        if card['name'] == card_name:
            card['quantity'] -= quantity
            if card['quantity'] <= 0:
                current_cards.remove(card)
            break
    
    deck_in = DeckUpdate(cards=current_cards)
    return await update_deck(deck_id, deck_in, current_user, db)

@router.put("/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: int,
    deck_in: DeckUpdate,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
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
        if key == 'is_public':
            value = int(value)
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
