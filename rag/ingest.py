from .chunker import chunk_documents
from .vector_store import add_documents,vector_store


def main():
    vector_store.reset_collection()
    
    chunks = chunk_documents()
    
    print("Total Chunks",len(chunks))
    
    add_documents(chunks)
    
    print("Document added to chromaDB Successfully")
    

if __name__ =="__main__":
    main()