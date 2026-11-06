from langchain_core.prompts import ChatPromptTemplate
from .llm import llm



def rewrite_query(question: str):

    prompt = ChatPromptTemplate.from_template("""
      You are an expert search query optimization assistant
    for an e-commerce knowledge base.

    Your task is to rewrite the customer's question into
    a focused search query.

    IMPORTANT RULES:

    1. Preserve the exact intent of the original question.
    2. Identify the main topic before rewriting.
    3. Do not mix different topics unnecessarily.

    TOPIC-SPECIFIC GUIDELINES:

    - RETURN POLICY:
      Focus on return eligibility, return window,
      delivery date, product condition, original packaging,
      return requirements and return requests.

    - REFUND POLICY:
      Focus on refund eligibility, refund approval,
      refund processing time, payment method and
      refund status.

    - SHIPPING POLICY:
      Focus on shipping charges, delivery time,
      order processing and shipment tracking.

    - PRODUCT INFORMATION:
      Focus on product name, category, specifications,
      price and stock availability.

    4. Include relevant keywords and specific conditions
       from the original question.
    5. Do not introduce unrelated terms.
    6. Do not answer the question.
    7. Return only the rewritten search query.
    8. Keep the query concise.

    Customer question: {question}

    Rewritten search query:

    """)

    chain = prompt | llm

    response = chain.invoke({"question": question})

    content = response.content

    if isinstance(content, list):
        rewritten_query = " ".join(
            item["text"]
            for item in content
            if isinstance(item, dict) and item.get("type") == "text"
        )
    else:
        rewritten_query = content

    return rewritten_query.strip()