import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage
import requests
from pyedhrec import EDHRec
from langchain.tools import tool


load_dotenv()
SQLITE_PATH = os.path.join("C:\\Users\\coman\\Desktop\\CommanderDeck\\server", "commander_deck.db")
API_BASE = "http://localhost:8000/api"

# Token global que se establece antes de cada invocación del agente
_current_token = ""
_current_deck_id = None

def _auth_headers():
    """Devuelve headers de autenticación usando el token del usuario actual"""
    return {"Authorization": f"Bearer {_current_token}"}


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
            
        response = requests.post(f"{API_BASE}/decks", json={
            "deck_name": commander,
            "type": "commander",
            "bracket": "2",
            "partner": 0,
            "cards": cards
        }, headers=_auth_headers())
    
    except Exception as e:
        return f"Error al obtener el deck de {commander}: {e}"
    
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
    response = requests.post(
        f"{API_BASE}/decks/add-card", 
        params={"deck_id": deck_id},
        json=json_cards_list, 
        headers=_auth_headers()
    )
    
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
    
    results = []
    for card in card_list:
        quantity_str = card.split(" ", 1)[0]
        card_name = card.split(" ", 1)[1]
        
        # Eliminamos las cartas mediante la api (una a una según el endpoint actual)
        response = requests.post(
            f"{API_BASE}/decks/remove-card", 
            params={
                "deck_id": deck_id, 
                "card_name": card_name, 
                "quantity": int(quantity_str)
            },
            headers=_auth_headers()
        )
        if response.ok:
            results.append(f"{quantity_str}x {card_name}")
        else:
            print(f"Error removiendo {card_name}: {response.text}")
            
    return f"Las cartas {results} han sido removidas"

@tool
def deck_info(deck_id: int, prompt: str):
    """
    Consulta el deck actual.
    
    Args:
        deck_id (int): El ID del deck.
        prompt (str): El prompt del usuario.
    
    Returns:
        dict: El deck actual, el nombre del commander y el prompt del usuario.
    """
    response = requests.get(f"{API_BASE}/decks/{deck_id}", headers=_auth_headers())
    
    return {"deck": response.json(), "commander": response.json()["deck_name"], "prompt": prompt}

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
    
    response = requests.put(f"{API_BASE}/decks/{deck_id}", json={
        "bracket": bracket
    }, headers=_auth_headers())
    
    return response.json()

@tool
def commander_check(commander_names: list[str]):
    """
    Comprueba si el commander existe.
    
    Args:
        commander_name (str): El nombre del commander.
    
    Returns:
        bool: True si el commander existe, False en caso contrario.
    """
    edhrec = EDHRec()
    results = []
    for commander_name in commander_names:
        try:
            card = edhrec.get_card_details(commander_name)
            if "legendary creature" in card["type"].lower():
                results.append(card["name"])
        except:
            continue
    return results
    


# Variables globales para reutilización
_client = None
_agente = None
_checkpointer = None

async def process_prompt(prompt: str, thread_id: str = None, token: str = "", deck_id: int = None):
    """Inicializa el agente y lo cachea para reutilización"""
    global _client, _agente, _checkpointer, _current_token, _current_deck_id
    
    # Establecer el token del usuario actual para que las tools lo usen
    _current_token = token
    _current_deck_id = deck_id
    
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
    
        custom_tools = [get_commander_deck, add_cards, remove_cards, deck_info, update_deck, commander_check]
        all_tools = tools + custom_tools
 
        nvidiaModel = ChatOllama(model="gemma4:26b", base_url="http://192.168.117.119:11434", reasoning=True, max_tokens=12000)
    
        _agente = create_agent(
            model=nvidiaModel,
            tools=all_tools,
            checkpointer=_checkpointer,
            system_prompt="Eres un asistente especializado en Magic: The Gathering que ayuda a los usuarios a gestionar sus mazos Commander. " \
            "Tu principal función es llamar a las herramientas disponibles para crear, modificar y consultar mazos." \
            "IMPORTANTE: Responde SIEMPRE en español, sin importar el idioma de la respuesta de las herramientas." \
            "Si el usuario no especifica presupuesto, asume que es 'budget'." \
            "Sé claro, conciso y natural en tus respuestas." \
            "Para agregar o quitar cartas, usa el formato 'cantidad nombre_carta' (ej: '2 Plains')." \
            "No inventes información que no tengas y sé preciso con los datos." \
            "Presenta la información de forma ordenada y fácil de leer." \
            "Siempre que los comandantes que se pidan no existan o la herramienta de get_commander_deck no los encuentre, sugiere comandantes similares."
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
            print(prompt)
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