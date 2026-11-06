from langchain_core.tools import tool
from backend.database import SessionLocal
from tools.product_tool import get_product_by_name

@tool

def search_product(product_name:str)->str:
    """
    Search for a product using its name or category.
    Returns product name, category, price and available stock.
    """
    db = SessionLocal()
    
    try:
        
        product = get_product_by_name(db,product_name)
        
        if not product:
            return {
                "message":"Product not found"
            }
        return product
    
    finally:
        db.close()