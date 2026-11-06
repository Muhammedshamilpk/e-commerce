from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os
from .config import COLLECTION_NAME,CHROMA_DIR
from .rewriting_query import rewrite_query

load_dotenv(override=True)

HF_TOKEN = os.getenv("HF_TOKEN")

embedding_model = HuggingFaceEmbeddings(
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
)

vector_store = Chroma(
    collection_name = COLLECTION_NAME,
    embedding_function=embedding_model,
    persist_directory=CHROMA_DIR,
    collection_metadata={"hnsw:space": "cosine"}
) 

# texts	Stores the actual text of each chunk
# metadatas	Stores information about each chunk, such as its source PDF
# ids	Stores a unique identifier for each chunk


def add_documents(chunks):
    texts = []
    metadatas =[]
    ids = []
    
    for index,item in enumerate(chunks):
        texts.append(item["text"])
        
        metadatas.append(
            {
            "source":item["filename"]
            }
        )
        
        ids.append(f"{item['filename']}_{index}")
        
        
    if texts:
        vector_store.add_texts(
            texts=texts,
            metadatas=metadatas,
            ids=ids
        )
        
def delete_documents(filename:str):
    vector_store.delete(
        where = {"source":filename}
    )
            
            
def search_documents(query:str,top_k:int = 3):
    
    rewritten_query = rewrite_query(query)

    print("\nOriginal Query:", query)
    print("Rewritten Query:", rewritten_query)
    
    results = vector_store.similarity_search(
        rewritten_query,
        k=top_k
    )
        
    return [
        {
            "text":document.page_content,
            "filename":document.metadata.get("source","Unknown"),
            "chunk_number": document.metadata.get("chunk_number")
        }
        for document in results
    ]
    
    
if __name__ == "__main__":
    results = vector_store.get(
        where={"source": "return_policy.pdf"},
        include=["documents", "metadatas"]
    )

    for i, document in enumerate(results["documents"]):
        print(f"\n--- Return Policy Chunk {i + 1} ---")
        print(document)