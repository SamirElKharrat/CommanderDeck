from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import aiosqlite

from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.config import settings
from ..schemas.user import UserCreate, UserOut, Token, PasswordChange
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
async def register(user_in: UserCreate, db: aiosqlite.Connection = Depends(get_db)):
    # Verificar si el email ya existe
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (user_in.email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    print(user_in)
    # Hashear password
    hashed_password = get_password_hash(user_in.password)
    
    # Insertar usuario
    cursor = await db.execute(
        "INSERT INTO users (user_name, email, password, image) VALUES (?, ?, ?, ?)",
        (user_in.user_name, user_in.email, hashed_password, user_in.image)
    )
    user_id = cursor.lastrowid
    
    # Asignar rol "user"
    cursor_role = await db.execute("SELECT id FROM roles WHERE role_name = 'user'")
    role = await cursor_role.fetchone()
    if role:
        await db.execute(
            "INSERT INTO role_user (user_id, role_id) VALUES (?, ?)",
            (user_id, role['id'])
        )
    
    await db.commit()
    
    # Recuperar el usuario creado para devolverlo
    cursor = await db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = await cursor.fetchone()
    return dict(user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: aiosqlite.Connection = Depends(get_db)):
    # En OAuth2PasswordRequestForm, username suele ser el identificador (en nuestro caso email)
    cursor = await db.execute("SELECT * FROM users WHERE email = ?", (form_data.username,))
    user = await cursor.fetchone()
    
    if not user or not verify_password(form_data.password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user['id'], expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}

@router.put("/change-password")
async def change_password(
    data: PasswordChange, 
    current_user: aiosqlite.Row = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    if not verify_password(data.old_password, current_user['password']):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    hashed_password = get_password_hash(data.new_password)
    await db.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        (hashed_password, current_user['id'])
    )
    await db.commit()
    return {"message": "Password changed successfully"}
