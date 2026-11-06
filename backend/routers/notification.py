from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import NotificationLog
from ..schemas import NotificationCreate

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)


@router.post("/order")
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db)
):

    notification = NotificationLog(
        order_id=data.order_id,
        notification_type=data.notification_type,
        recipient=str(data.recipient),
        notification_status=data.notification_status,
        message=data.message
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return {
        "success": True,
        "message": "Notification logged successfully",
        "notification_id": notification.id,
        "order_id": notification.order_id
    }