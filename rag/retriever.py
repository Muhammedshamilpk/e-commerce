import os

from langchain_core.runnables import RunnableLambda
from .rewriting_query import rewrite_query
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from .vector_store import vector_store
from dotenv import load_dotenv
from .llm import llm



def retrieve_documents(inputs):
    original_question = inputs["input"]

    rewritten_query = rewrite_query(original_question)

    print("\nOriginal Question:", original_question)
    print("Rewritten Query:", rewritten_query)

    documents = vector_store.max_marginal_relevance_search(
        query=rewritten_query,
        k=6,
        fetch_k=15,
        lambda_mult=0.7
    )

    return documents
retriever = RunnableLambda(retrieve_documents)


prompt = ChatPromptTemplate.from_messages(
    [(
        
("system", """You are an e-commerce customer support assistant.

Your task is to answer customer questions using ONLY
the information provided in the retrieved context.

STRICT RULES:

1. Read all the retrieved context carefully before answering.

2. Use only facts explicitly supported by the retrieved
   documents. Do not use outside knowledge.

3. You may recognize different wording that has the
   same meaning, but do not assume facts that are
   not present in the context.

4. Never invent company policies, procedures, conditions,
   dates, prices, numbers, or recommendations.

5. Pay special attention to important details such as
   deadlines, return conditions, refund periods,
   product specifications, and eligibility requirements.

6. If only part of the requested information is available,
   provide that part and clearly state which information
   could not be found.

7. Do not combine unrelated information from different
   documents to create an unsupported answer.

8. If the requested information is completely missing
   from the context, respond exactly:
   "I could not find that information in the available documents."

9. Keep answers clear, simple, and relevant to the
   customer's question.
   
10. Do not treat different business actions as equivalent.
    For example, reporting product damage and requesting
    a return are different actions. Preserve the exact
    meaning of the retrieved documents.

Retrieved context:
{context}
""")

),
     ("human","{input}"),
])

# Combine retrieved documents and generate an answer

document_chain = create_stuff_documents_chain(
    llm,
    prompt,
)

rag_chain = create_retrieval_chain(
    retriever,
    document_chain
)

def ask_question(question):
    result = rag_chain.invoke({"input": question})
    print("\nAnswer:")
    print(result["answer"])
    
    answer = result["answer"]
    sources = []
    print("\nSources:")
    for document in result["context"]:
        source =  document.metadata.get("source", "Unknown source")
        
        if source not in sources :
            sources.append(source)
    sources.sort() 
    print(sources)
        
    return {
        "answer":answer,
        "sources":sources
            }

if __name__ == "__main__":

    questions = [
        "How long does a refund take?",
        "What are the shipping charges?",
        "What is the stock availability of RO Filter Premium?"
    ]

    for question in questions:

        print("\n" + "=" * 60)
        print("QUESTION:", question)

        result = ask_question(question)

        print("\nANSWER:", result["answer"])
        print("SOURCES:", result["sources"])