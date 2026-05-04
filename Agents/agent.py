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
SQLITE_PATH = os.path.join("E:\CommanderDeck\server", "commander_deck.db")



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
            "bracket": budget,
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

# Esta función pinta de forma bonita las herramientas que se descargan de un mcp
def pretty_tool(tool):
    print(f"\n🛠️ TOOL: {tool.name}")
    print("-" * 50)

    print("📄 Descripción:")
    print(indent(tool.description.strip(), "  "))

    print("\n📥 Argumentos (JSON Schema):")
    try:
        schema = tool.args_schema
        print(indent(json.dumps(schema, indent=2, ensure_ascii=False), "  "))
    except Exception:
        print("  No disponible")

    print("\n📌 Campos requeridos:")
    try:
        required = tool.args_schema.get("required", [])
        print(f"  {required}")
    except Exception:
        print("  No disponible")

    print("\n⚙️ Response format:")
    print(f"  {getattr(tool, 'response_format', 'N/A')}")

    print("\n🔧 Tipo:")
    print(f"  {type(tool)}")

    print("-" * 50)


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
    
        custom_tools = [get_commander_deck]
        all_tools = tools + custom_tools
 
        nvidiaModel = ChatOllama(model="gemma4:e4b", reasoning=True)
    
        _agente = create_agent(
            model=nvidiaModel,
            tools=all_tools,
            checkpointer=_checkpointer,
            system_prompt="Eres un asistente que llama a herramientas. " \
            "Devuelve la salida en español si la tool devuelve la información en inglés." \
            "Si el usuario no da la información de budget, asume que es budget." \
            "La salida debe estar bonita y legible." \
            "Si una tool suelta un error solo devuelve ese error, no intentes hacer nada si las tools no funcionan"  
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