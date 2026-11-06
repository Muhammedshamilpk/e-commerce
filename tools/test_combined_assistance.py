
from tools.product_agent import ask_product_question

questions = [
    "What is the price and stock of RO Filter Premium?",
    "What is the return policy?",
]

for question in questions:

    print("\nQuestion:", question)

    result = ask_product_question(question)

    print("AI RESPONSE:", result["answer"])
    print("SOURCES:", result["sources"])
