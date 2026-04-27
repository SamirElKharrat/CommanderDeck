import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage
from langchain.tools import tool
import json
from textwrap import indent
from pyedhrec import EDHRec
from rag.retriever import upload_deck

load_dotenv()


@tool
def get_commander_deck(commander: str, budget: str, collection: str):
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

    # Obtener el average deck
    avg_deck = edhrec.get_commanders_average_deck(commander,budget)
    
    # Guardar en ChromaDB
    upload_deck(avg_deck["decklist"], collection)
    
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


async def main():

    client = MultiServerMCPClient(
        {
            "magicCommander": {
                "transport": "stdio",
                "command": "python",
                "args": ["-m", "mtg_mcp"]
            }
        }
    )

    # Nos descargamos las herramientas
    tools = await client.get_tools()
    
    custom_tools = [get_commander_deck]
    
    all_tools = tools + custom_tools


    try:
        prompts = await client.get_prompt("magicCommander", "nombrePrompt1") # Ejemplo
    except Exception as e:
        print("No existe el prompt con el nombre asociado")
    
    try:
        resources = await client.get_resources()
    except Exception as e:
        print("No existen recursos en este MCP")

    for tool in tools:
       pretty_tool(tool)
       
    nvidiaModel = ChatNVIDIA(
        model="z-ai/glm4.7",
        api_key=os.environ["NVIDIA_API_KEY"],
        temperature=1,
        max_completion_tokens=20000,
        top_p=0.95
    )
    
    agente = create_agent(
        model=nvidiaModel, # Usad alguno vuestro
        tools=all_tools,
        system_prompt="Eres un asistente que llama a herramientas. " \
        "Devuelve la salida en español si la tool devuelve la información en inglés." \
        "Si el usuario no da la información de budget, asume que es budget." \
        "La salida debe estar bonita y legible."
    )


    while (prompt := input("> ")) != "end":
       async for paso in agente.astream({
            "messages": [
                HumanMessage(prompt)
            ]
        }, stream_mode="values"):
            ultimo_mensaje = paso["messages"][-1]

            hayRazonamiento = ""
            if hasattr(ultimo_mensaje, "additional_kwargs"): # sí, asi de escondido está el razonamiento
                hayRazonamiento = ultimo_mensaje.additional_kwargs.get("reasoning_content", "")

            if hayRazonamiento:
                print("\n=== PENSANDO ===")
                print(hayRazonamiento)

            print("\n=== MENSAJE ===")
            ultimo_mensaje.pretty_print()


# Lanzamos de forma concurrente. Es como la clase Thread de Java
asyncio.run(main())