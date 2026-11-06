# from fastapi import APIRouter,HTTPException,status,Depends,Query
# from sqlalchemy.orm import Session 
# from sqlalchemy import or_
# from ..database import get_db
# from ..models import ChatHistory
# from ..schemas import ChatRequest
# from  ..models import Customer
# from tools.product_agent import ask_product_question

# router = APIRouter(prefix = "/ai",
#                    tags = ["AI Assistant"])





# @router.post("/chat")
# def chat_with_ai(request:ChatRequest,
#                  db:Session = Depends(get_db)):
#     try:
#         result = ask_product_question(request.question)
        
#         answer = result["answer"]
        
        
        
#         if isinstance(answer, list):
#             answer = "\n".join(
#                 item.get("text", "")
#                 for item in answer
#                 if isinstance(item, dict)
#                 and item.get("type") == "text"
#             )
#         else:
#             answer = str(answer)
        
#         chat = ChatHistory(
#             customer_id = request.customer_id,
#             question = request.question,
#             answer = result["answer"],
#             sources = ",".join(result["sources"]) 
#         )
        
#         db.add(chat)
#         db.commit()
#         db.refresh(chat)
        
#         return {
#             "id":chat.id,
#             "customer_id":chat.customer_id,
#             "question":chat.question,
#             "answer":chat.answer,
#             "sources":result["sources"],
#             "created_at":chat.created_at
#         }
#     except Exception as e:
#         db.rollback()
        
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail = f"AI response generation failed: {str(e)}"
#         )
        
        
# @router.get("/history")
# def get_chat_history(
#     page:int = Query(1,ge=1),
#     page_size:int =Query(10,ge=1,le=100),
#     db:Session=Depends(get_db)
# ):
#     try:
#         total_chats = db.query(ChatHistory).count()
        
#         chats = (
#             db.query(ChatHistory)
#             .order_by(ChatHistory.created_at.desc())
#             .offset((page-1) * page_size)
#             .limit(page_size)
#             .all()
#         )
        
#         return {
#             "total_chats":total_chats,
#             "page":page,
#             "page_size":page_size,
#             "total_pages":(total_chats + page_size - 1) // page_size,
#             "history":[
#                 {
#                     "id":chat.id,
#                     "question":chat.question,
#                     "answer":chat.answer,
#                     "sources":
#                         (
#                             [
#                             source.strip()
#                             for source in chat.sources.split(",")
#                             if source.strip()
#                         ] if chat.sources else []
#                         ),
#                         "created_at":chat.created_at
#                 }
#                 for chat in chats
#             ]
#         }
        
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Unable to retrieve chat history: {str(e)}"
#         )
        
        
        
        
# @router.get("/history/search")
# def search_chat_history(
#     keyword:str = Query(...,min_length=1),
#     customer_id:int = None,
#     page :int = Query(1,ge=1),
#     page_size :int = Query(10,ge=1,le=100),
#     db:Session = Depends(get_db)
# ):
    
#     try:
#         query = db.query(ChatHistory)
        
#         if customer_id is not None:
#             customer = (
#                 db.query(Customer).filter(Customer.id == customer_id).first()
#             )
            
#             if not customer :
#                 raise HTTPException(
#                     status_code = status.HTTP_404_NOT_FOUND,
#                     detail = "Customer Not found"
#                 )
                
#             query = query.filter(ChatHistory.customer_id == customer_id)
        
#          # Search in both question and answer
#         query = query.filter(
#             or_(
#                 ChatHistory.question.ilike(f"%{keyword}%"),
#                 ChatHistory.answer.ilike(f"%{keyword}%")
#             )
#         )
#         total_results = query.count()

#         chats = (
#             query.order_by(ChatHistory.created_at.desc())
#             .offset((page - 1) * page_size)
#             .limit(page_size)
#             .all()
#         )

#         return {
#             "keyword": keyword,
#             "customer_id": customer_id,
#             "total_results": total_results,
#             "page": page,
#             "page_size": page_size,
#             "history": [
#                 {
#                     "id": chat.id,
#                     "customer_id": chat.customer_id,
#                     "question": chat.question,
#                     "answer": chat.answer,
#                     "sources": (
#                         [
#                             source.strip()
#                             for source in chat.sources.split(",")
#                             if source.strip()
#                         ] if chat.sources else []
#                     ),
#                     "created_at": chat.created_at
#                 }
#                 for chat in chats
#             ]
#         }

#     except HTTPException:
#         raise

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Chat history search failed: {str(e)}"
#         )
        
        
        
        
        
# @router.get("/history/{customer_id}")
# def get_customer_chat_history(
#     customer_id:int,
#     page:int= Query(1,ge=1 ),
#     page_size:int = Query(10,ge=1,le=100),
#     db:Session = Depends(get_db)
# ):
    
#     try:
#         customer = (db.query(Customer).
#                     filter(Customer.id == customer_id).first())
        
#         if not customer:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail = "Customer not found"
#             )
            
#         query = db.query(ChatHistory).filter(ChatHistory.customer_id == customer_id)
        
#         total_chats = query.count()
        
#         chats = (
#             query.order_by(ChatHistory.created_at.desc())
#             .offset((page-1)*page_size)
#             .limit(page_size)
#             .all()
#         )
        
#         return {
            
#             "customer_id": customer_id,
#             "total_chats": total_chats,
#             "page": page,
#             "page_size": page_size,
#             "total_pages": (total_chats + page_size - 1) // page_size,
#             "history": [
#                 {
#                     "id": chat.id,
#                     "question": chat.question,
#                     "answer": chat.answer,
#                     "sources": (
#                         chat.sources.split(", ")
#                         if chat.sources else []
#                     ),
#                     "created_at": chat.created_at
#                 }
#                 for chat in chats
#             ]
#         }

#     except HTTPException:
#         raise

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Unable to retrieve customer chat history: {str(e)}"
#         )



# @router.delete("/history/{chat_id}")
# def delete_chat(chat_id:int,
#                 db:Session = Depends(get_db)):
    
#     try:
#         chat = (
#             db.query(ChatHistory)
#             .filter(ChatHistory.id == chat_id)
#             .first()
#         )
        
#         if not chat:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail = "Chat Not Found"
#             )
            
#         db.delete(chat)
#         db.commit()
        
#         return {
#             "message":"Chat history deleted Successfully",
#             "chat_id":chat_id
#         }
        
#     except HTTPException:
#         raise
    
#     except Exception as e:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail = f"Chat deletion failed : {str(e)}"
#         )
        
# @router.delete("/history/customer/{customer_id}")
# def delete_customer_chat_history(
#     customer_id: int,
#     db: Session = Depends(get_db)
# ):
#     try:
#         customer = (
#             db.query(Customer)
#             .filter(Customer.id == customer_id)
#             .first()
#         )

#         if not customer:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Customer not found"
#             )

#         deleted_count = (
#             db.query(ChatHistory)
#             .filter(ChatHistory.customer_id == customer_id)
#             .delete(synchronize_session=False)
#         )

#         db.commit()

#         return {
#             "message": (
#             "Chat history deleted successfully"
#             if deleted_count > 0
#             else "No chat history found for this customer"
#         ),
#         "customer_id": customer_id,
#         "deleted_count": deleted_count
#         }

#     except HTTPException:
#         raise

#     except Exception as e:
#         db.rollback()
#         raise HTTPException(
#             status_code=500,
#             detail=f"Customer chat history deletion failed: {str(e)}"
#         )




from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import ChatHistory, Customer
from ..schemas import ChatRequest
from tools.product_agent import ask_product_question


router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)


# Convert the RAG answer into a string
def format_answer(answer):
    if isinstance(answer, list):
        return "\n".join(
            item.get("text", "")
            for item in answer
            if isinstance(item, dict) and item.get("type") == "text"
        )

    return str(answer)


# Convert sources into a consistent list
def format_sources(sources):
    if not sources:
        return []

    if isinstance(sources, str):
        return [
            source.strip()
            for source in sources.split(",")
            if source.strip()
        ]

    return [str(source).strip() for source in sources if str(source).strip()]


# Save sources as a comma-separated string
def save_sources(sources):
    return ", ".join(format_sources(sources))


# Common chat response
def chat_response(chat):
    return {
        "id": chat.id,
        "customer_id": chat.customer_id,
        "question": chat.question,
        "answer": chat.answer,
        "sources": format_sources(chat.sources),
        "created_at": chat.created_at
    }


# --------------------------------------------------
# 1. ASK AI QUESTION
# --------------------------------------------------

@router.post("/chat")
def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    try:
        result = ask_product_question(request.question)

        answer = format_answer(result["answer"])
        sources = format_sources(result.get("sources", []))

        chat = ChatHistory(
            customer_id=request.customer_id,
            question=request.question,
            answer=answer,
            sources=save_sources(sources)
        )

        db.add(chat)
        db.commit()
        db.refresh(chat)

        return chat_response(chat)

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI response generation failed: {str(e)}"
        )


# --------------------------------------------------
# 2. GET ALL CHAT HISTORY
# --------------------------------------------------

@router.get("/history")
def get_chat_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(ChatHistory)

        total_chats = query.count()

        chats = (
            query
            .order_by(ChatHistory.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return {
            "total_chats": total_chats,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_chats + page_size - 1) // page_size,
            "history": [
                chat_response(chat)
                for chat in chats
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve chat history: {str(e)}"
        )


# --------------------------------------------------
# 3. SEARCH CHAT HISTORY
# --------------------------------------------------

@router.get("/history/search")
def search_chat_history(
    keyword: str = Query(..., min_length=1),
    customer_id: int = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(ChatHistory)

        if customer_id is not None:
            customer = (
                db.query(Customer)
                .filter(Customer.id == customer_id)
                .first()
            )

            if not customer:
                raise HTTPException(
                    status_code=404,
                    detail="Customer not found"
                )

            query = query.filter(
                ChatHistory.customer_id == customer_id
            )

        query = query.filter(
            or_(
                ChatHistory.question.ilike(f"%{keyword}%"),
                ChatHistory.answer.ilike(f"%{keyword}%")
            )
        )

        total_results = query.count()

        chats = (
            query
            .order_by(ChatHistory.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return {
            "keyword": keyword,
            "customer_id": customer_id,
            "total_results": total_results,
            "page": page,
            "page_size": page_size,
            "history": [
                chat_response(chat)
                for chat in chats
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat history search failed: {str(e)}"
        )


# --------------------------------------------------
# 4. GET CHAT HISTORY FOR ONE CUSTOMER
# --------------------------------------------------

@router.get("/history/{customer_id}")
def get_customer_chat_history(
    customer_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        customer = (
            db.query(Customer)
            .filter(Customer.id == customer_id)
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

        query = db.query(ChatHistory).filter(
            ChatHistory.customer_id == customer_id
        )

        total_chats = query.count()

        chats = (
            query
            .order_by(ChatHistory.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return {
            "customer_id": customer_id,
            "total_chats": total_chats,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_chats + page_size - 1) // page_size,
            "history": [
                chat_response(chat)
                for chat in chats
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to retrieve customer chat history: {str(e)}"
        )


# --------------------------------------------------
# 5. DELETE ONE CHAT
# --------------------------------------------------

@router.delete("/history/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db)
):
    try:
        chat = (
            db.query(ChatHistory)
            .filter(ChatHistory.id == chat_id)
            .first()
        )

        if not chat:
            raise HTTPException(
                status_code=404,
                detail="Chat not found"
            )

        db.delete(chat)
        db.commit()

        return {
            "message": "Chat history deleted successfully",
            "chat_id": chat_id
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Chat deletion failed: {str(e)}"
        )


# --------------------------------------------------
# 6. DELETE ALL CHAT HISTORY FOR ONE CUSTOMER
# --------------------------------------------------

@router.delete("/history/customer/{customer_id}")
def delete_customer_chat_history(
    customer_id: int,
    db: Session = Depends(get_db)
):
    try:
        customer = (
            db.query(Customer)
            .filter(Customer.id == customer_id)
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found"
            )

        deleted_count = (
            db.query(ChatHistory)
            .filter(ChatHistory.customer_id == customer_id)
            .delete(synchronize_session=False)
        )

        db.commit()

        return {
            "message": (
                "Chat history deleted successfully"
                if deleted_count > 0
                else "No chat history found for this customer"
            ),
            "customer_id": customer_id,
            "deleted_count": deleted_count
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Customer chat history deletion failed: {str(e)}"
        )