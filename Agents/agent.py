import asyncio
import sys
import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from pyedhrec import EDHRec
from langchain.tools import tool

load_dotenv()
SQLITE_PATH = os.path.join("..\\server", "commander_deck.db")
API_BASE = "http://localhost:8000/api"

# Token global que se establece antes de cada invocación del agente
_current_token = ""
_current_deck_id = None

def _auth_headers():
    """Devuelve headers de autenticación usando el token del usuario actual"""
    return {"Authorization": f"Bearer {_current_token}"}

def log_to_file(content: str):
    """Escribe un log en logsai.txt"""
    try:
        with open("logsai.txt", "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {content}\n")
    except Exception as e:
        print(f"Error escribiendo log: {e}")

@tool
def get_commander_deck(commander: str, budget: str, bracket: str = "2"):
    """
    Obtiene el deck promedio de un commander de EDHRec y lo guardara en ChromaDB.
    
    Args:
        commander (str): El nombre del commander.
        budget (str): El presupuesto del deck (budget o expensive). Si no se dice budget se queda como budget
        bracket (str, optional): El nivel de poder del mazo (1 a 5). Por defecto "2".
    
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
            "bracket": bracket,
            "partner": 0,
            "cards": cards
        }, headers=_auth_headers())
    
    except Exception as e:
        return f"Error al obtener el deck de {commander}: {e}"
    
    return f"El deck de {commander} ha sido creado"

@tool
def create_deck(commander: str, bracket: str, card_list: list[str]):
    """
    Crea un nuevo deck experimental. Esta herramienta SOLO debe usarse después de generar un deck experimental usando mtg-commander-deck.
    
    Args:
        commander (str): El nombre del commander.
        bracket (str): El bracket del deck (ej. "2").
        card_list (list[str]): La lista de cartas con sus cantidades, ej: ["1 Sol Ring", "1 Lightning Bolt"].
    
    Returns:
        str: Confirmación de creación del deck.
    """
    edhrec = EDHRec()
    cards_json = []

    for card in card_list:
        try:
            quantity = card.split(" ", 1)[0]
            card_name = card.split(" ", 1)[1]
        except IndexError:
            continue
            
        try:
            card_details = edhrec.get_card_details(card_name)
        except:
            # Si falla, añadimos información básica
            cards_json.append({
                "name": card_name,
                "quantity": quantity,
                "details": "",
                "type": "",
                "mana_cost": "",
                "version": ""
            })
            continue

        unique_art = card_details.get("unique_artwork", [])
        image_uri = ""
        if unique_art and len(unique_art) > 0:
            image_uris = unique_art[0].get("image_uris", [])
            if image_uris and len(image_uris) > 0:
                image_uri = image_uris[0]

        cards_json.append({
            "name": card_details.get("name", card_name),
            "quantity": quantity,
            "details": card_details.get("oracle_text", ""),
            "type": card_details.get("type", ""),
            "mana_cost": card_details.get("mana_cost", ""),
            "version": image_uri
        })

    try:
        response = requests.post(f"{API_BASE}/decks", json={
            "deck_name": commander,
            "type": "commander",
            "bracket": bracket,
            "partner": 0,
            "cards": cards_json
        }, headers=_auth_headers())
        
        if not response.ok:
            return f"Error al crear el deck experimental: {response.text}"
            
    except Exception as e:
        return f"Error al crear el deck experimental: {e}"
    
    return f"El deck experimental de {commander} ha sido creado correctamente en la base de datos."

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
    
    return {"deck": response.json(), "prompt": prompt}

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
def cards_check(card_names: list[str]):
    """
    Comprueba si las cartas existen.

    Args:
        card_names (list[str]): Los nombres de las cartas.

    Returns:
        list(dict): Lista de diccionarios con el nombre y los detalles de las cartas.
    """
    edhrec = EDHRec()
    json_cards_list = []
    for card_detail in card_names:
        try:
            card_detail = edhrec.get_card_details(card_detail)
            json_cards_list.append({
            "name": card_detail.get("name", ""),
            "details": card_detail.get("oracle_text", ""),
            "type": card_detail.get("type", ""),
            "mana_cost": card_detail.get("mana_cost", ""),
            "version": card_detail.get("unique_artwork", [{}])[0].get("image_uris", [""])[0]
        })
        except:
            continue

    return json_cards_list
    

# Variables globales para reutilización
_client = None
_agente = None
_checkpointer = None

async def process_prompt(prompt: str, thread_id: str = None, token: str = "", deck_id: int = None):
    """Inicializa el agente y lo cachea para reutilización"""
    global _client, _agente, _checkpointer, _current_token, _current_deck_id
    
    _current_token = token
    _current_deck_id = deck_id
    
    # Log del prompt del usuario
    log_to_file(f"USER PROMPT (thread={thread_id}, deck={deck_id}): {prompt}")
    
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
 
        tools = await _client.get_tools()
        custom_tools = [get_commander_deck, create_deck, add_cards, remove_cards, deck_info, update_deck, cards_check]
        all_tools = tools + custom_tools
 
        nvidiaModel = ChatGoogleGenerativeAI(
            model="gemini-3.1-flash-lite",
            api_key="",
            temperature=1,
            top_p=1,
            max_output_tokens=16384,
        )
    
        _agente = create_agent(
            model=nvidiaModel,
            tools=all_tools,
            checkpointer=_checkpointer,
            system_prompt=(
                "Eres un asistente especializado en Magic: The Gathering para la gestión de mazos Commander. "
                "Respondes siempre en español, con claridad y precisión, sin inventar información. "
                "No uses emoticonos en ninguna respuesta.\n\n"
                "IDIOMA Y TONO\n"
                "- Responde siempre en español, independientemente del idioma en que respondan las herramientas.\n"
                "- Sé conciso, directo y organiza la información de forma legible.\n"
                "- No añadas relleno ni explicaciones innecesarias.\n\n"
                "FLUJO OBLIGATORIO DE HERRAMIENTAS\n"
                "Antes de responder cualquier pregunta sobre un mazo, sigue este orden sin excepción:\n"
                "  1. Llama a deck_info para obtener el estado actual del mazo.\n"
                "  2. Solo después, llama a las herramientas adicionales que la operación requiera.\n"
                "Este orden es obligatorio aunque la pregunta parezca simple o ya tengas contexto previo.\n\n"
                "VERIFICACION DE CARTAS\n"
                "Siempre que el usuario mencione cartas, debes verificar su existencia real con cards_check.\n\n"
                "FORMATO DE CARTAS\n"
                "- Para añadir o quitar cartas usa el formato: 'cantidad nombre_carta'.\n"
                "- Cuando menciones el nombre de una carta de Magic en tu respuesta textual, envuélvelo SIEMPRE entre dobles corchetes, por ejemplo: [[Sol Ring]] o [[Atraxa, Praetors' Voice]]. Esto es vital para el frontend.\n\n"
                "BRACKETS DE PODER (1-5)\n"
                "- En Magic Commander, los mazos se dividen en 5 brackets de poder (1 es nivel bajo, 5 es máximo/cEDH).\n"
                "- Aplica el bracket correcto si el usuario lo especifica o dedúcelo de la conversación. Si no se especifica y no se puede deducir, asume bracket 2.\n\n"
                "PRESUPUESTO\n"
                "Si el usuario no indica presupuesto, asume siempre 'budget'.\n\n"
                "CREACION DE MAZOS\n"
                "Usa get_commander_deck para crear mazos normales. Solo usa la herramienta mtg-commander-deck si el usuario explícitamente pide un 'mazo experimental'. "
                "Cuando el usuario pida un mazo experimental, primero usa mtg-commander-deck para obtener la lista de cartas, y DESPUÉS usa obligatoriamente la herramienta create_deck para guardar ese mazo en la base de datos.\n\n"
                "REGLA DE 100 CARTAS\n"
                "- Un mazo de Commander DEBE tener exactamente 100 cartas (incluyendo el comandante).\n"
                "- Cuando crees un mazo o revises uno existente, comprueba el total de cartas.\n"
                "- Si el mazo tiene menos de 100 cartas, DEBES añadir las cartas necesarias para llegar a 100 respetando colores y bracket.\n"
                "- Si tiene más de 100, indica cuáles quitar. NUNCA dejes un mazo sin 100 cartas sin advertirlo.\n\n"
                "PRESENTACION DE RESULTADOS\n"
                "- Organiza las listas de cartas por categoría.\n"
                "- Usa listas con guiones.\n"
                "- Indica cantidades y costes claros.\n"
                "- Si hay errores, comunícalo de forma explícita."
            )
        )
    
        if thread_id is None:
            thread_id = "default"
    
        config = {"configurable": {"thread_id": thread_id}}
        logged_tool_calls = set()
    
        async for paso in _agente.astream({
            "messages": [HumanMessage(prompt)]
        }, stream_mode="values", config=config):
            ultimo_mensaje = paso["messages"][-1]

            # Log de razonamiento
            hayRazonamiento = ""
            if hasattr(ultimo_mensaje, "additional_kwargs"):
                hayRazonamiento = ultimo_mensaje.additional_kwargs.get("reasoning_content", "")

            if hayRazonamiento:
                log_to_file(f"AI REASONING: {hayRazonamiento}")
                print("\n=== PENSANDO ===")
                print(hayRazonamiento)

            # Log de tool calls
            if hasattr(ultimo_mensaje, "tool_calls") and ultimo_mensaje.tool_calls:
                for tc in ultimo_mensaje.tool_calls:
                    tc_id = tc.get("id")
                    if tc_id not in logged_tool_calls:
                        log_to_file(f"AI TOOL CALL: {tc['name']}({tc['args']})")
                        logged_tool_calls.add(tc_id)

            if not isinstance(ultimo_mensaje, HumanMessage): 
                ultimo_mensaje.pretty_print()

        # Log de respuesta final
        log_to_file(f"AI RESPONSE: {ultimo_mensaje.content}")
        log_to_file("-" * 50)

        # Handle Gemini response format (list of objects)
        content = ultimo_mensaje.content
        if isinstance(content, list):
            # Extract text from Gemini's structured response
            text_parts = []
            for item in content:
                if isinstance(item, dict):
                    if 'text' in item:
                        text_parts.append(item['text'])
                    elif 'content' in item:
                        text_parts.append(item['content'])
                elif isinstance(item, str):
                    text_parts.append(item)
            content = ' '.join(text_parts)
        elif not isinstance(content, str):
            content = str(content)

        return content

async def main():
    while (prompt := input("> ")) != "end":
        response = await process_prompt(prompt, "console_thread")
        print(f"\n=== RESPUESTA ===\n{response}")

if __name__ == "__main__":
    asyncio.run(main())