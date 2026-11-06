from pydantic import BaseModel,ConfigDict,EmailStr,Field
from datetime import datetime
from typing import Literal
from decimal import Decimal

#Product

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    price: float
    stock: int
    image: str | None = None
    
class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    category: str | None = None
    price: float | None = None
    stock: int | None = None
    status: str | None = None
    image: str | None = None
    

class ProductResponse(BaseModel):
        id: int
        name: str
        sku:str | None
        category: str | None
        price: float | None
        stock: int | None
        status: str | None
        image: str | None
        
        model_config = ConfigDict(from_attributes=True)
        

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    location: str 

    model_config = ConfigDict(from_attributes=True)
    
class OrderResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    order_date: datetime | None
    status: str
    total_amount: float

    model_config = ConfigDict(from_attributes=True)
    
    
class OrderListResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    order_date: datetime | None
    status: str
    total_amount: float

    customer: CustomerResponse | None = None
    product: ProductResponse | None = None

    model_config = ConfigDict(from_attributes=True)
    
    
class TicketResponse(BaseModel):
    id: int
    customer_id: int
    issue: str
    category: str
    status: str
    priority: str
    created_at: datetime | None
    customer: CustomerResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class TicketStatusUpdate(BaseModel):
    status: str

class TicketPriorityUpdate(BaseModel):
    priority: str
    
    
class ChatRequest(BaseModel):
    question: str
    customer_id :int | None = None
    
    
    
class TicketMessageCreate(BaseModel):
    sender: str
    message: str


class TicketMessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender: str
    message: str
    created_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
    
    
class NotificationCreate(BaseModel):
    order_id: int
    notification_type: Literal["admin_order_notification","customer_order_confirmation"]
    recipient: EmailStr
    notification_status: Literal["sent","failed"]
    message: str | None = None
    
    

class OrderCreate(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(gt=0)
    total_amount: float = Field(gt=0)