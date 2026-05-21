import aiosqlite
import os
from .config import settings

DATABASE_URL = settings.DATABASE_PATH

async def get_db():
    db = await aiosqlite.connect(DATABASE_URL)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    async with aiosqlite.connect(DATABASE_URL) as db:
        # Usuarios
        await db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name   TEXT    NOT NULL,
            email       TEXT    NOT NULL UNIQUE,
            password    TEXT    NOT NULL,
            image       TEXT    DEFAULT '',
            created_at  TEXT    DEFAULT (datetime('now'))
        );
        """)

        # Roles
        await db.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            role_name TEXT    NOT NULL UNIQUE
        );
        """)

        # Asignación de rol al usuario (N:M)
        await db.execute("""
        CREATE TABLE IF NOT EXISTS role_user (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
            UNIQUE(user_id, role_id)
        );
        """)

        # Mazos
        await db.execute("""
        CREATE TABLE IF NOT EXISTS decks (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            deck_name TEXT    NOT NULL,
            type      TEXT    NOT NULL DEFAULT 'commander',
            bracket   TEXT    DEFAULT '',
            partner   INTEGER DEFAULT 0,
            cards     TEXT    DEFAULT '[]',
            is_public INTEGER DEFAULT 0,
            original_deck_id INTEGER DEFAULT NULL,
            owner_username TEXT DEFAULT '',
            created_at TEXT   DEFAULT (datetime('now'))
        );
        """)

        # Migraciones (Añadir nuevas columnas si la tabla ya existía)
        try:
            await db.execute("ALTER TABLE decks ADD COLUMN is_public INTEGER DEFAULT 0")
        except Exception:
            pass
            
        try:
            await db.execute("ALTER TABLE decks ADD COLUMN original_deck_id INTEGER DEFAULT NULL")
        except Exception:
            pass

        try:
            await db.execute("ALTER TABLE decks ADD COLUMN owner_username TEXT DEFAULT ''")
        except Exception:
            pass


        # Insertar roles por defecto si no existen
        await db.execute("INSERT OR IGNORE INTO roles (role_name) VALUES ('user')")
        await db.execute("INSERT OR IGNORE INTO roles (role_name) VALUES ('admin')")
        
        await db.commit()
