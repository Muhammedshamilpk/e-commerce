
from rag.rewriting_query import rewrite_query

questions = [
    "What is the return policy?",
    "Can I return a damaged product?",
    "How long does a refund take?",
    "What are the shipping charges?",
    "What is the stock availability of RO Filter Premium?"
]

for question in questions:
    rewritten = rewrite_query(question)

    print("\nOriginal:", question)
    print("Rewritten:", rewritten)
