#sample data

from .database import SessionLocal
from .models import Product,Customer,Order,Ticket

def seed_data():
    db=SessionLocal()
    
    try:
        products = [Product
            (
                name = "iphone 13",
                category="Water Purifier",
                price=4999,
                stock=34
            ),
               Product(
                name="Shower Filter Pro",
                category="Shower Filter",
                price=2499,
                stock=12
            ),
            Product(
                name="Tap Filter Basic",
                category="Tap Filter",
                price=999,
                stock=87
            ),
            Product(
                name="RO Filter Premium",
                category="RO Filter",
                price=3499,
                stock=5
            ),
            Product(
                name="Kitchen Filter Plus",
                category="Kitchen Filter",
                price=1999,
                stock=21
            )
        ]
        
        db.add_all(products)
        db.commit()
        
        customers = [
            Customer(
                name="Rahul Kumar",
                email="rahul@example.com",
                location="Bangalore"
            ),
            Customer(
                name="Anjali Nair",
                email="anjali@example.com",
                location="Kochi"
            ),
            Customer(
                name="Arjun Singh",
                email="arjun@example.com",
                location="Mumbai"
            ),
            Customer(
                name="Priya Sharma",
                email="priya@example.com",
                location="Delhi"
            ),
            Customer(
                name="Vivek Menon",
                email="vivek@example.com",
                location="Chennai"
            )
        ]

        db.add_all(customers)
        db.commit()
        orders = [
            Order(
                customer_id=1,
                product_id=1,
                quantity=2,
                status="Delivered",
                total_amount=9998
            ),
            Order(
                customer_id=2,
                product_id=2,
                quantity=1,
                status="Pending",
                total_amount=2499
            ),
            Order(
                customer_id=3,
                product_id=4,
                quantity=3,
                status="Shipped",
                total_amount=10497
            ),
            Order(
                customer_id=4,
                product_id=3,
                quantity=2,
                status="Delivered",
                total_amount=1998
            ),
            Order(
                customer_id=5,
                product_id=5,
                quantity=1,
                status="Pending",
                total_amount=1999
            ),
            Order(
                customer_id=1,
                product_id=3,
                quantity=5,
                status="Delivered",
                total_amount=4995
            ),
            Order(
                customer_id=2,
                product_id=1,
                quantity=1,
                status="Shipped",
                total_amount=4999
            )
        ]
        
        db.add_all(orders)
        db.commit()

        tickets = [
            Ticket(
                customer_id=1,
                issue="Product arrived damaged",
                category="Damage",
                status="Open"
            ),
            Ticket(
                customer_id=2,
                issue="Where is my order?",
                category="Shipping",
                status="Open"
            ),
            Ticket(
                customer_id=3,
                issue="I want to return the product",
                category="Return",
                status="Open"
            ),
            Ticket(
                customer_id=4,
                issue="The product is not working",
                category="Product Issue",
                status="Resolved"
            ),
            Ticket(
                customer_id=5,
                issue="I want a refund",
                category="Refund",
                status="Open"
            )
        ]
         
        db.add_all(tickets)
        db.commit()
        
        print("Sample data inserted successfully!")
        
    except Exception as e:
        db.rollback()
        print("Error:",e)
        
    finally:
        db.close()
        
    
        
if __name__=="__main__":
    seed_data()