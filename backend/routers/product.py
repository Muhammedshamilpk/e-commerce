from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..models import Product
from ..database import get_db
from ..schemas import ProductResponse , ProductCreate , ProductUpdate

router = APIRouter(prefix = "/product",
                   tags = ["Product"])


#Product

@router.get("/",response_model = list[ProductResponse])
def get_products(db:Session = Depends(get_db)):
    products = db.query(Product).all()
    
    return products

@router.get("/{product_id}",response_model = ProductResponse)
def get_product(product_id:int,db:Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "Product is not found"
        )
    return product



# POST: Add a new product
@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    product = Product(
        name=product_data.name,
        sku=product_data.sku.strip(),
        category=product_data.category,
        price=product_data.price,
        stock=product_data.stock,
        status="Active" if product_data.stock > 0 else "Out of Stock",
        image=product_data.image
    )

    db.add(product)

    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This SKU already exists."
        )

    return product


# PUT: Update an existing product
@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    update_data = product_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "sku" and value is not None:
            value = value.strip()

        setattr(product, field, value)

    # Automatically update status when stock changes,
    # unless the request explicitly supplies a status.
    if "stock" in update_data and "status" not in update_data:
        product.status = (
            "Active" if product.stock > 0 else "Out of Stock"
        )

    try:
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This SKU already exists."
        )

    return product


# DELETE: Delete a product
@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }
