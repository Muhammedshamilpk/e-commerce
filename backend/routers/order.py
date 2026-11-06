from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import traceback
from ..database import get_db
from ..models import Order, Customer, Product
from ..schemas import OrderResponse, OrderListResponse,OrderCreate
from ..services.n8n_service import trigger_order_created

router = APIRouter(
    prefix="/order",
    tags=["Order"]
)


## Get All Orders
@router.get("/", response_model=list[OrderListResponse])
def get_orders(db: Session = Depends(get_db)):

    results = (
        db.query(Order, Customer, Product)
        .outerjoin(Customer, Order.customer_id == Customer.id)
        .outerjoin(Product, Order.product_id == Product.id)
        .all()
    )

    return [
        {
            "id": order.id,
            "customer_id": order.customer_id,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "order_date": order.order_date,
            "status": order.status,
            "total_amount": order.total_amount,
            "customer": customer,
            "product": product,
        }
        for order, customer, product in results
    ]

# Get Single Order
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):

    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not Found"
        )

    return order


@router.post("/", status_code=201)
async def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db)
):
    try:
        order = Order(
            customer_id=data.customer_id,
            product_id=data.product_id,
            quantity=data.quantity,
            total_amount=data.total_amount,
            status="pending"
        )

        db.add(order)
        db.commit()
        db.refresh(order)

    except Exception as e:
        db.rollback()
        print("ORDER CREATION ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail="Failed to create order"
        )

    n8n_triggered = False

    try:
        await trigger_order_created(
            order_id=order.id,
            event_id=f"order_{order.id}"
        )
        n8n_triggered = True

    except Exception as e:
        print("n8n webhook failed:", repr(e))

    return {
        "success": True,
        "message": "Order created successfully",
        "data": {
            "order_id": order.id,
            "customer_id": order.customer_id,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "total_amount": order.total_amount,
            "status": order.status
        },
        "n8n_triggered": n8n_triggered
    }