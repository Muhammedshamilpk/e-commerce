from sqlalchemy import Column,String,Integer,Float,DateTime,ForeignKey,Text
from sqlalchemy import func
from .database import Base
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku=Column(String, unique=True, nullable=True)
    category = Column(String)
    price = Column(Float)
    stock = Column(Integer)
    status = Column(String, default="Active")
    image = Column(Text, nullable=True)
    


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    location = Column(String)
    

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    order_date = Column(DateTime, server_default=func.now())
    status = Column(String)
    total_amount = Column(Float)
    

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    issue = Column(String, nullable=False)
    category = Column(String)
    status = Column(String)
    priority = Column(String, default="Medium")
    created_at = Column(DateTime, server_default=func.now())
    
    
    messages = relationship(
    "TicketMessage",
    back_populates="ticket",
    cascade="all, delete-orphan"
    )
    
    customer = relationship("Customer")
    
    
class TicketMessage(Base):
    
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer,ForeignKey("tickets.id"),nullable=False)

    sender = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    created_at = Column(DateTime,server_default=func.now())

    ticket = relationship("Ticket",back_populates="messages")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer,primary_key=True,index=True)
    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=True
    )
    question = Column(String,nullable=False)
    answer = Column(Text,nullable=False)
    sources = Column(Text)
    created_at = Column(
        DateTime,
        server_default=func.now()
    )
    
    
class NotificationLog(Base):
    
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(Integer, nullable=False, index=True)

    notification_type = Column(String(100),nullable=False)

    recipient = Column(String(255),nullable=False)

    notification_status = Column(String(50),nullable=False)

    message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True),server_default=func.now(),nullable=False)