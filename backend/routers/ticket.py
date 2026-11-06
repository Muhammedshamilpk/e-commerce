from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..models import Ticket,TicketMessage
from ..schemas import TicketResponse, TicketStatusUpdate,TicketMessageCreate,TicketMessageResponse, TicketPriorityUpdate

router = APIRouter(prefix="/ticket",
                   tags = ["Ticket"])

#tickets

@router.get("/",response_model = list[TicketResponse])
def get_tickets(db:Session = Depends(get_db)):
    tickets = db.query(Ticket).options(joinedload(Ticket.customer)).all()
    
    
    return tickets

@router.get("/{ticket_id}",response_model = TicketResponse)
def get_tickets(ticket_id:int,db:Session = Depends(get_db)):
    ticket = db.query(Ticket).options(joinedload(Ticket.customer)).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail = "Ticket is not Found"
            )

    return ticket



# Update ticket status
@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: int,
    ticket_data: TicketStatusUpdate,
    db: Session = Depends(get_db)
):
    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.customer))
        .filter(Ticket.id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket is not found"
        )

    allowed_statuses = ["Open", "In Progress", "Resolved", "Closed"]

    if ticket_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket status"
        )

    ticket.status = ticket_data.status

    db.commit()
    db.refresh(ticket)

    return ticket


# Get all messages for a ticket
@router.get(
    "/{ticket_id}/messages",
    response_model=list[TicketMessageResponse]
)
def get_ticket_messages(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return (
        db.query(TicketMessage)
        .filter(TicketMessage.ticket_id == ticket_id)
        .order_by(TicketMessage.created_at.asc())
        .all()
    )


# Add a message to a ticket
@router.post(
    "/{ticket_id}/messages",
    response_model=TicketMessageResponse
)
def create_ticket_message(
    ticket_id: int,
    message_data: TicketMessageCreate,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if not message_data.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    if message_data.sender not in ["Customer", "Admin"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid sender"
        )

    new_message = TicketMessage(
        ticket_id=ticket_id,
        sender=message_data.sender,
        message=message_data.message.strip()
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.patch("/{ticket_id}/priority")
def update_ticket_priority(
    ticket_id: int,
    priority_data: TicketPriorityUpdate,
    db: Session = Depends(get_db)
):
    allowed_priorities = ["Low", "Medium", "High", "Urgent"]

    if priority_data.priority not in allowed_priorities:
        raise HTTPException(
            status_code=400,
            detail="Invalid priority. Use Low, Medium, High, or Urgent."
        )

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.priority = priority_data.priority

    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket priority updated successfully",
        "priority": ticket.priority
    }