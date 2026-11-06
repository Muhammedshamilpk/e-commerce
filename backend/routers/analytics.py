from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime
from ..database import get_db
from ..models import Product, Order, Ticket, Customer

router= APIRouter(
    prefix="/analytics",
    tags = ["Analytics"]
)


#Pending Order

@router.get("/pending_order")
def pending_orders(db:Session = Depends(get_db)):
    pending = db.query(Order).filter(Order.status == "Processing").count()
    
    return {
        "Pending Orders":pending
    } 
    
    
    
#Low Stock Products

@router.get("/low_stocks")
def low_stocks(threshold:int=10,db:Session = Depends(get_db)):
    products = db.query(Product).filter(Product.stock <= threshold).all()
    
    return {
        "threshold":threshold,
        "products":products
    } 
    
#open tickets

@router.get("/open_tickets")
def open_tickets(db:Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.status == "Open")
    count = tickets.count()
    show = tickets.all()
    
    
    return {
        "total opened tickets":count,
        "tickets":show
    } 
    
    
# Total Sales (Completed Orders Only)

@router.get("/total_sales")
def total_sales(db: Session = Depends(get_db)):

    total = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.status == "Delivered")
        .scalar()
    )

    return {
        "total_sales": float(total or 0)
    }
    
# Total Orders
@router.get("/total_orders")
def total_orders(db: Session = Depends(get_db)):
    count = db.query(Order).count()

    return {
        "total_orders": count
    }


# Total Customers
@router.get("/total_customers")
def total_customers(db: Session = Depends(get_db)):
    count = db.query(Customer).count()

    return {
        "total_customers": count
    }


# Total Products
@router.get("/total_products")
def total_products(db: Session = Depends(get_db)):
    count = db.query(Product).count()

    return {
        "total_products": count
    }
    
# Monthly Revenue (Last 12 Months)
@router.get("/monthly_revenue")
def monthly_revenue(db: Session = Depends(get_db)):

    results = (
        db.query(
            extract("year", Order.order_date).label("year"),
            extract("month", Order.order_date).label("month"),
            func.sum(Order.total_amount).label("revenue")
        )
        .filter(Order.status == "Delivered")
        .group_by(
            extract("year", Order.order_date),
            extract("month", Order.order_date)
        )
        .order_by(
            extract("year", Order.order_date),
            extract("month", Order.order_date)
        )
        .all()
    )

    return [
        {
            "year": int(row.year),
            "month": int(row.month),
            "revenue": float(row.revenue or 0)
        }
        for row in results
    ]
    
# Order Status Breakdown
@router.get("/order_status")
def order_status(db: Session = Depends(get_db)):

    results = (
        db.query(
            Order.status,
            func.count(Order.id).label("count")
        )
        .group_by(Order.status)
        .all()
    )

    return [
        {
            "status": row.status,
            "count": row.count
        }
        for row in results
    ]
    
# Top Selling Products
@router.get("/top_products")
def top_products(db: Session = Depends(get_db)):

    results = (
        db.query(
            Product.id,
            Product.name,
            func.sum(Order.quantity).label("total_sold")
        )
        .join(Order, Product.id == Order.product_id)
        .filter(Order.status == "Delivered")
        .group_by(Product.id, Product.name)
        .order_by(func.sum(Order.quantity).desc())
        .limit(5)
        .all()
    )

    return [
        {
            "product_id": row.id,
            "product_name": row.name,
            "total_sold": int(row.total_sold or 0)
        }
        for row in results
    ]