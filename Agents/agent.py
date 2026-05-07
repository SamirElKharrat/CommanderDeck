import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
import aiosqlite
import json
import requests
from textwrap import indent
from pyedhrec import EDHRec
from langchain.tools import tool
from rag.retriever import upload_deck


load_dotenv()
SQLITE_PATH = os.path.join("C:\\Users\\coman\\Desktop\\CommanderDeck\\server", "commander_deck.db")



@tool
def get_commander_deck(commander: str, budget: str):
    """
    Obtiene el deck promedio de un commander de EDHRec y lo guardara en ChromaDB.
    
    Args:
        commander (str): El nombre del commander.
        budget (str): El presupuesto del deck (budget o expensive). Si no se dice budget se queda como budget
        collection (str): La colección donde se guardará el deck. Siempre sera el nombre del commandante del mazo juntos.
    
    Returns:
        str: El deck promedio del commander.
    """
    edhrec = EDHRec()
    cards = []

    # Obtener el average deck y los detalles de cada carta
    try:
        print(f"Obteniendo deck de {commander} con budget {budget}")
        avg_deck = edhrec.get_commanders_average_deck(commander,budget)
        
        for card in avg_deck["decklist"]:
            quantity = card.split(" ", 1)[0]
            card = card.split(" ", 1)[1]
            try:
                card_details = edhrec.get_card_details(card)
            except:
                continue
            cards.append({
            "name": card_details.get("name", ""),
            "quantity": quantity,
            "details": card_details.get("oracle_text", ""),
            "type": card_details.get("type", ""),
            "mana_cost": card_details.get("mana_cost", ""),
            "version": card_details.get("unique_artwork", [{}])[0].get("image_uris", [""])[0]
            })
            
        response = requests.post("http://localhost:8000/api/decks", json={
            "deck_name": commander,
            "type": "commander",
            "bracket": "2",
            "partner": 0,
            "cards": cards
        }, headers={"Authorization": f"Bearer X"})
    
    except Exception as e:
        return f"Error al obtener el deck de {commander}: {e}"
    
    
    
    # Guardar en ChromaDB
    collection_name = f"{commander}_{response.json()['id']}"
    print(f"Collection name: {collection_name}")
    upload_deck(avg_deck["decklist"], collection_name)
    
    return f"El deck de {commander} ha sido creado"

@tool
def add_cards(deck_id: int, card_list: list[str]):
    """
    Agrega cartas al deck.
    
    Args:
        deck_id (int): El ID del deck.
        card_list (list(str)): La lista de cartas a agregar con sus cantidades. Ejemplo: ["2 Sol Ring", "1 Lightning Bolt"]
    
    Returns:
        str: La carta agregada.
    """
    edhrec = EDHRec()
    
    
    json_cards_list = []
    for card in card_list:
        quantity = card.split(" ", 1)[0]
        card = card.split(" ", 1)[1]
        try:
            card_detail = edhrec.get_card_details(card)
        except:
            return f"La carta {card} no se encontró"
        json_cards_list.append({
            "name": card_detail.get("name", ""),
            "quantity": quantity,
            "details": card_detail.get("oracle_text", ""),
            "type": card_detail.get("type", ""),
            "mana_cost": card_detail.get("mana_cost", ""),
            "version": card_detail.get("unique_artwork", [{}])[0].get("image_uris", [""])[0]
        })
    
    # Añadimos las cartas al ChromaDB especifico
    
    # Añadimos las cartas mediante la api    
    response = requests.post("http://localhost:8000/api/decks/add-card", json={
        "deck_id": deck_id,
        "card_data": json_cards_list
    }, headers={"Authorization": f"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg2ODQ2ODMsInN1YiI6IjEifQ.Vg0uQ4wAqQtRWic1HoH3CC7cp6U2NQBYOqvt_Xve9OE"})
    
    return f"Las cartas {json_cards_list} han sido agregadas"

@tool
def remove_cards(deck_id: int, card_list: list[str]):
    """
    Remueve cartas del deck.
    
    Args:
        deck_id (int): El ID del deck.
        card_list (list(str)): La lista de cartas a remover con sus cantidades. Ejemplo: ["2 Sol Ring", "1 Lightning Bolt"]
    
    Returns:
        str: La carta removida.
    """
    edhrec = EDHRec()
    
    json_cards_list = []
    for card in card_list:
        quantity = card.split(" ", 1)[0]
        card = card.split(" ", 1)[1]
        try:
            card_detail = edhrec.get_card_details(card)
        except:
            return f"La carta {card} no se encontró"
        json_cards_list.append({
            "name": card_detail.get("name", ""),
            "quantity": quantity,
            "details": card_detail.get("oracle_text", ""),
            "type": card_detail.get("type", ""),
            "mana_cost": card_detail.get("mana_cost", ""),
            "version": card_detail.get("unique_artwork", [{}])[0].get("image_uris", [""])[0]
        })
        
    # Eliminamos las cartas al ChromaDB especifico
        
    # Eliminamos las cartas mediante la api    
    response = requests.post("http://localhost:8000/api/decks/remove-card", json={
        "deck_id": deck_id,
        "card_data": json_cards_list
    }, headers={"Authorization": f"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg2ODQ2ODMsInN1YiI6IjEifQ.Vg0uQ4wAqQtRWic1HoH3CC7cp6U2NQBYOqvt_Xve9OE"})
    
    return f"Las cartas {json_cards_list} han sido removidas"

@tool
def deck_info(deck_id: int):
    """
    Consulta el deck actual.
    
    Args:
        deck_id (int): El ID del deck.
    
    Returns:
        dict: El deck actual.
    """
    response = requests.get(f"http://localhost:8000/api/decks/{deck_id}", headers={"Authorization": f"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg3Njg4MTAsInN1YiI6IjEifQ.-J0cGK7xRTDfHuJNxbiig-9m4RguSXjb6b92wm4Chbo"})
    
    return response.json()

@tool
def update_deck(deck_id:int, bracket: str):
    """
    Actualización del mazo.
    
    Args:
        deck_id (int): El ID del deck.
        bracket (str): El bracket actualizado.
    
    Returns:
        str: El mazo actualizado.
    """
    
    response = requests.put(f"http://localhost:8000/api/decks/{deck_id}", json={
        "bracket": bracket
    }, headers={"Authorization": f"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzg3Njg4MTAsInN1YiI6IjEifQ.-J0cGK7xRTDfHuJNxbiig-9m4RguSXjb6b92wm4Chbo"})
    
    return response.json()
    


# Variables globales para reutilización
_client = None
_agente = None
_checkpointer = None

async def process_prompt(prompt: str, thread_id: str = None):
    """Inicializa el agente y lo cachea para reutilización"""
    global _client, _agente, _checkpointer
    
    # Inicializar checkpointer SQLite persistente
    async with AsyncSqliteSaver.from_conn_string(SQLITE_PATH) as _checkpointer:
        _client = MultiServerMCPClient(
            {
                "magicCommander": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["-m", "mtg_mcp"]
                }
            }
        )
 
        # Nos descargamos las herramientas
        tools = await _client.get_tools()
    
        custom_tools = [get_commander_deck, add_cards, remove_cards, deck_info, update_deck]
        all_tools = tools + custom_tools
 
        nvidiaModel = ChatOllama(model="gemma4:e2b", reasoning=True, max_tokens=12000)
    
        _agente = create_agent(
            model=nvidiaModel,
            tools=all_tools,
            checkpointer=_checkpointer,
            system_prompt="Eres un asistente que llama a herramientas. " \
            "Devuelve la salida en español si la tool devuelve la información en inglés." \
            "Si el usuario no da la información de budget, asume que es budget." \
            "La salida debe estar bonita y legible." \
            "Si una tool suelta un error solo devuelve ese error, no intentes hacer nada si las tools no funcionan" \
            "Si el usuario pide agregar o quitar 2 Plains por ejemplo, manda '2 Plains' (sin comillas), no una lista con 2 plains" \
            "Si se pide bracket_info se manda en str la información de todos los brackets disponibles"
        )
    
        if thread_id is None:
            thread_id = "default"
    
        config = {
            "configurable": {"thread_id": thread_id}
        }
    
        response_parts = []
    
        async for paso in _agente.astream({
            "messages": [
                HumanMessage(prompt)
            ]
        }, stream_mode="values",
        config=config):
            ultimo_mensaje = paso["messages"][-1]

            hayRazonamiento = ""
            if hasattr(ultimo_mensaje, "additional_kwargs"): # sí, asi de escondido está el razonamiento
                hayRazonamiento = ultimo_mensaje.additional_kwargs.get("reasoning_content", "")

            if hayRazonamiento:
                print("\n=== PENSANDO ===")
                print(hayRazonamiento)

            print("\n=== MENSAJE ===")
            if not isinstance(ultimo_mensaje, HumanMessage): # para que no me repita dos veces el msg del user
                        ultimo_mensaje.pretty_print()

        return ultimo_mensaje.content

async def main():
    while (prompt := input("> ")) != "end":
        response = await process_prompt(prompt, "console_thread")
        print(f"\n=== RESPUESTA ===")
        print(response)

if __name__ == "__main__":
    asyncio.run(main())