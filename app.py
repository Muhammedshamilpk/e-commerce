import streamlit as st
from rag.vector_store import vector_store
from pathlib import Path
from rag.retriever import ask_question



st.set_page_config(
    page_title = "E-Commerce Support Assistant"
)

st.title("E-Commerce Support Assistant")

st.caption(
    "Ask Questions about refund,returns,shipping and product info"
)

if "messages" not in st.session_state:
    st.session_state.messages=[]
    
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        
        if message["role"] == "assistant" and message.get("sources"):
            with st.expander("View retrieved documents"):
                for source,content in message["sources"]:
                    st.markdown(f"**Source: {source}**")
                    st.write(content)
        
#input box

question = st.chat_input("Ask your question...")

if question:
    st.session_state.messages.append(
        {"role":"user","content":question}
    )
    
    with st.chat_message("user"):
        st.markdown(question)
        
    with st.chat_message("assistant"):
        with st.spinner("Searching your documents..."):
            answer = ask_question(question)
        st.markdown(answer)

    

        st.session_state.messages.append(
            {
                        "role": "assistant",
                        "content": answer,
                
            }
                )
        
