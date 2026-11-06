from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Customer
from ..schemas import CustomerResponse

router = APIRouter(prefix = "/customer",
                   tags = ["Customer"])



#Customer

#Retrieve all customers.

@router.get("/",response_model=list[CustomerResponse])
def get_customers(db:Session = Depends(get_db)):
    customers = db.query(Customer).all()
    
    return customers

#Retrieve one customer.

@router.get("/{cusomer_id}",response_model=CustomerResponse)
def get_customer(customer_id:int,db:Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail = "Customer not Found"
        )
    
    return customer
