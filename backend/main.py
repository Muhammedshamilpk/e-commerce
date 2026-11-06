from fastapi import FastAPI
from .database import Base,engine
from .routers import product,customer,order,ticket,analytics,document,ai,notification
from . import models
from fastapi.middleware.cors import CORSMiddleware
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI E-commerce Operations Assistant",
    description="AI-powered e-commerce operations backend",
    version="1.0.0"
    )


FRONTEND_URL = os.getenv("FRONTEND_URL")

allowed_origins = ["http://localhost:3000"]

if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notification.router)
app.include_router(product.router)
app.include_router(customer.router)
app.include_router(order.router)
app.include_router(ticket.router)
app.include_router(analytics.router)
app.include_router(document.router)
app.include_router(ai.router)
      
