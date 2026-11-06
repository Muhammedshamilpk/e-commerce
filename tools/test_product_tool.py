# from backend.database import SessionLocal
# from tools.product_tool import get_all_products, get_product_by_name

# db = SessionLocal()

# try:
#     print("ALL PRODUCTS:")
#     print(get_all_products(db))

#     print("\nSEARCH PRODUCT:")
#     print(get_product_by_name(db, "Water"))

# finally:
#     db.close()


# from tools.product_langchain_tool import search_product

# result = search_product.invoke({
#     "product_name": "RO Filter Premium"
# })

# print(result)



from tools.product_agent import ask_product_question

question = "What is the price and available stock of RO Filter Premium?"

answer = ask_product_question(question)

print("\nAI RESPONSE:")
print(answer)