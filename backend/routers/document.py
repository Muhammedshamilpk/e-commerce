from fastapi import APIRouter,UploadFile,File,HTTPException,status
from rag.config import DOCUMENT_DIR
from rag.chunker import chunk_documents
from rag.vector_store import add_documents,delete_documents
import uuid
import shutil
from pathlib import Path
from fastapi.responses import FileResponse

router = APIRouter(
        prefix = "/document",
        tags = ["Document"]
                   )


@router.post("/upload")
async def upload_document(file:UploadFile = File(...)):
    
    
    #  Validate PDF File
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "Only PDF files are aloowed"
        )
    
    DOCUMENT_DIR.mkdir(parents=True,exist_ok=True)
    
    # Generate a unique file name
    
    document_id = str(uuid.uuid4())
    filename = f"{document_id}_{Path(file.filename).name}"
    file_path = DOCUMENT_DIR/filename
    
    # save the uploaded file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file,buffer)
            
        chunks = chunk_documents(file_path)
        
        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail = "No readable text found in PDF"
            )
        
        add_documents(chunks)
        
        return {
            "message":"Document uploaded and indexed successfully",
            "documnet_id":document_id,
            "filename":filename,
            "total_chunks":len(chunks)
        }        
        
    except HTTPException:
        file_path.unlink(missing_ok=True)
        raise

    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(e)}"
        )

    finally:
        await file.close()
        
@router.get("/")
def list_documents():
    DOCUMENT_DIR.mkdir(parents=True , exist_ok=True)
    
    documents =[]
    
    for file_path in DOCUMENT_DIR.glob("*.pdf"):
        documents.append({
            "file_name":file_path.name,
            "file_size_kb":round(file_path.stat().st_size /1024,2)
        }
        )
        
    return {
        "total_documents":len(documents),
        "documents":documents
    }
    

@router.delete("/{filename}")
def delete_document(filename:str):
    if Path(filename).name != filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "Invalid File Name"
        )
    file_path = DOCUMENT_DIR/filename
    
    if not file_path.is_file() or file_path.suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail = "File Not Found"
        )
        
    try:
        
        delete_documents(filename)
        
        file_path.unlink()
       
        return {
            "message": "Document and its associated chunks deleted successfully",
            "filename": filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"Document Deletion is Failed:{str(e)}"
        )
        
        
@router.put("/replace/{filename}")
async def replace_document(
    filename:str,
    file:UploadFile=File(...)
):
    if Path(filename).name != filename or not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "Invalid Filename"
        )
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail = "Only PDF Files are allowded"
        )
        
    old_path = DOCUMENT_DIR/filename
    
    if not old_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail = "Document not found"
                    
        )
        
    temp_path = DOCUMENT_DIR/f"temp_{uuid.uuid4()}.pdf"
    
    try:
        # Save replacement PDF temporarily
        with temp_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract and create chunks from replacement
        chunks = chunk_documents(temp_path)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No readable text found in replacement PDF"
            )
            
        # Preserve the original filename in metadata
        for chunk in chunks:
            chunk["filename"] = filename
            
        # Remove old chunks and add new ones
        delete_documents(filename)
        add_documents(chunks)
        
        # Replace the original PDF
        temp_path.replace(old_path)
        
        return {
            "message": "Document replaced successfully",
            "filename": filename,
            "total_chunks": len(chunks)
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Document replacement failed: {str(e)}"
        )

    finally:
        temp_path.unlink(missing_ok=True)
        await file.close()


@router.get("/view/{filename}")
def view_document(filename: str):

    if Path(filename).name != filename or not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid filename"
        )

    file_path = DOCUMENT_DIR / filename

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename,
        content_disposition_type="inline"
    )