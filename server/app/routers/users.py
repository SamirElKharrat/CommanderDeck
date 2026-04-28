from fastapi import APIRouter, Depends, HTTPException
import aiosqlite

from ..core.database import get_db
from ..schemas.user import UserOut, UserUpdate
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=UserOut)
async def get_me(current_user: aiosqlite.Row = Depends(get_current_user)):
    return dict(current_user)

@router.put("/me", response_model=UserOut)
async def update_me(
    user_in: UserUpdate,
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        return current_user
    
    query = "UPDATE users SET "
    params = []
    for key, value in update_data.items():
        query += f"{key} = ?, "
        params.append(value)
    
    query = query.rstrip(", ") + " WHERE id = ?"
    params.append(current_user['id'])
    
    await db.execute(query, tuple(params))
    await db.commit()
    
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (current_user['id'],))
    updated_user = await cursor.fetchone()
    return dict(updated_user)

@router.delete("/me")
async def delete_me(
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    await db.execute("DELETE FROM users WHERE id = ?", (current_user['id'],))
    await db.commit()
    return {"message": "User deleted successfully"}
