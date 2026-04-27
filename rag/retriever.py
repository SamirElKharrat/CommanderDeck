"""
Usaremos este código para crear la base de datos vectorial.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain_core.documents import Document
from pyedhrec import EDHRec

CHROMA_DIR = "./chroma_db"


"""
Creamos los embeddings
"""
def crear_embeddings():

    embeddings = OllamaEmbeddings(
        model="mxbai-embed-large", # El modelo LLM a usar
        base_url="http://localhost:11434", # Esta es la URL de Ollama (local)
    )
    return embeddings


"""
Añadimos los embeddings a Chroma

"""
def crear_vectorstore(embeddings,chunks = None, collection = "default"):
    """
    Si la colección ya existe en disco, la reutiliza.
    Si no existe, indexa los documentos.
    """

    # Podéis usar este nétodo también, pero con menos control.
    # Si ya existe la colección la va a duplicar, así que
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
        collection_name=collection
    )

    num_docs = vectorstore._collection.count()

    if num_docs == 0:
        print("Guardamos documentos en Chroma")
        vectorstore.add_documents(chunks)
    else:
        print(f"Ya tenemos este número de documentos: {num_docs}")

    return vectorstore


def upload_deck(deck: list[str], collection: str):
    """
    Sube un deck a ChromaDB.
    
    Args:
        deck (list[str]): El deck a subir.
        collection (str): La colección donde se guardará el deck.
    
    Returns:
        str: Mensaje de éxito.
    """
    safe_collection = collection.replace(" ", "_").replace("-", "_")

    documents = [Document(page_content=card) for card in deck]
    embeddings = crear_embeddings()
    crear_vectorstore(embeddings, documents, safe_collection)
    return "Deck subido a ChromaDB"