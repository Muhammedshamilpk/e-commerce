from rag.rewriting_query import rewrite_query

questions = [
    "What is the return window?",
    "How long does delivery take?",
    "When will I get my refund?"
]

for question in questions:

    print("\nOriginal Question:", question)

    rewritten = rewrite_query(question)

    print("Rewritten Query:", rewritten)