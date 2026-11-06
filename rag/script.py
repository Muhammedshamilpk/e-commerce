
# from .retriever import ask_question

# def main():
#     print("E-commerce RAG Assistant")
#     print("Type 'exit' to stop.\n")
    
#     while True:
#         question = input("Ask Question: ").strip()
        
#         if question.lower() == "exit":
#             break
        
#         if not question:
#             continue
        
#         try:
#             ask_question(question)
#             print()
            
#         except Exception as error:
#             print(f"Error: {error}")            
            
# if __name__ == "__main__":
#     main()




from .retriever import rag_chain


test_questions = [
    "How long does a refund take?",
    "What is the return window?",
    "How long does standard delivery take?",
    "What are the features of Laptop Pro 14?",
    "What is the warranty period for Laptop Pro 14?"
]


for question in test_questions:
    print("\n" + "=" * 60)
    print("QUESTION:", question)
    print("=" * 60)

    result = rag_chain.invoke({"input": question})

    print("\nANSWER:")
    print(result["answer"])

    print("\nRETRIEVED SOURCES:")
    sources = sorted({
        doc.metadata.get("source", "Unknown source")
        for doc in result["context"]
    })

    for source in sources:
        print("-", source)
