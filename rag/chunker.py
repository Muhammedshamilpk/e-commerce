from langchain_text_splitters import RecursiveCharacterTextSplitter
from .document_loader import load_all_documents,load_pdf
from pathlib import Path
from .config import DOCUMENT_DIR




def chunk_documents(document_path=None):
    if document_path:
        documents = [{
            "filename":document_path.name,
            "text":load_pdf(document_path)
        }]
    else:
        documents = load_all_documents(DOCUMENT_DIR)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size = 300,
        chunk_overlap = 50,
          separators=[
            "\n\n",  # Prefer paragraph boundaries
            "\n",    # Then line boundaries
            " ",     # Then word boundaries
            ""       # Last resort: character boundaries
        ],
        length_function=len,
        keep_separator=True
    )
    
    

    chunks = []
    
    for document in documents:
        text_chunks = splitter.split_text(document["text"])
        
        for index,chunk in enumerate(text_chunks):
            chunks.append(
                {
                "filename":document["filename"],
                "chunk_number":index,
                "text":chunk
                }
            )
            
    return chunks

if __name__ == "__main__":
    chunks = chunk_documents()
    print("Total Chunks ",len(chunks))
    
    if chunks:
        print(chunks)
