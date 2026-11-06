from pathlib import Path
from pypdf import PdfReader
import re



# def load_pdf(file_path:Path) ->str:
    
#     """
#     Extract text from a PDF file.
#     """

#     reader= PdfReader(str(file_path))
    
#     text = ""
    
#     for page in reader.pages:
#         page_text = page.extract_text()
        
#         if page_text:
#             text+=page_text+"\n"
            
#     return text




def load_pdf(file_path: Path) -> str:
    """Extract and clean text from a PDF file."""

    reader = PdfReader(str(file_path))
    pages = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            # Fix whitespace between words
            page_text = re.sub(r"[ \t]*\n[ \t]*", " ", page_text)

            # Collapse repeated spaces
            page_text = re.sub(r"[ \t]+", " ", page_text)

            pages.append(page_text.strip())

    return "\n".join(pages)


def load_all_documents(document_dir:Path) :
    documents = []
    
    for file_path in document_dir.glob("*.pdf"):
        text = load_pdf(file_path)
        
        documents.append(
            {
                "filename":file_path.name,
                "text":text
            }
        )
    return documents