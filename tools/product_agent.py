from tools.product_langchain_tool import search_product
from dotenv import load_dotenv
from rag.llm import llm
from rag.retriever import ask_question
from langchain_core.messages import ToolMessage

load_dotenv()


llm_with_tools = llm.bind_tools([search_product])

def content_to_text(content):
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        return "\n".join(
            item.get("text", "")
            for item in content
            if isinstance(item, dict)
            and item.get("type") == "text"
        )

    return str(content)

def ask_product_question(question: str):

    messages = [
        (
           "system",
            """You are an e-commerce assistant.

            Use the search_product tool whenever the user asks
            about product names, prices, categories or stock.

            If the question is about company policies, returns,
            refunds, shipping or other document information,
            do not call the product tool.

            Never invent product information."""
        ),
        ("human", question)
    ]

    response = llm_with_tools.invoke(messages)

    if response.tool_calls:

        tool_results = []
        
        messages.append(response)

        for tool_call in response.tool_calls:
            if tool_call["name"] == "search_product":
                result = search_product.invoke(tool_call["args"])

                tool_results.append(
                    ToolMessage(
                        content=str(result),
                        tool_call_id = tool_call["id"]
                    )
         
                )
        # Generate final natural-language response        
        final_response = llm.invoke([
            (
                "system",
                """You are an e-commerce assistant.
                Answer the user's question using ONLY the
                database results provided below.
                Do not invent product details.
                If the product was not found, clearly say so."""
            ),
            (
                "human",
                f"""
                Customer question: {question}

                Database results: {tool_results}

                Generate a clear, natural-language answer.
                """
            )
        ])
        
        return {
            "answer": content_to_text(final_response.content),
            "sources":["PostgreSQL_products"]
        }



    # Otherwise, use the existing RAG system
    return ask_question(question)