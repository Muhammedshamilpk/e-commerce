from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent

DOCUMENT_DIR = PROJECT_DIR / "documents"

CHROMA_DIR = PROJECT_DIR / "rag" / "chromadb"

COLLECTION_NAME = "ecommerce_knowledge"

if __name__ == "__main__":
    for file_path in DOCUMENT_DIR.glob("*.pdf"):
        print(file_path)