from sqlalchemy.orm import Session
from backend.models import Product
from sqlalchemy import or_

def get_all_products(db:Session):
    products = db.query(Product).all()
    
    return [
        {
            "id":product.id,
            "name":product.name,
            "category":product.category,
            "price":product.price,
            "stock":product.stock
        }
        for product in products
    ]
    
def get_product_by_name(db:Session ,product_name:str):
    product = (
        db.query(Product)
        .filter(
            or_ (Product.name.ilike(f"%{product_name}%"),
                Product.category.ilike(f"%{product_name}%")
                )
        )
        .first()
    )
    
    if not product:
        return {
            "message":"Not available"
        }
    return {
        "id": product.id,
        "name": product.name,
        "category": product.category,
        "price": product.price,
        "stock": product.stock
    }