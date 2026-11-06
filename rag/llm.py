# from langchain_google_genai import ChatGoogleGenerativeAI
# import os 

# llm = ChatGoogleGenerativeAI(
#     model="gemini-3.5-flash"
# )


import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Locate .env in the project root
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(dotenv_path=ENV_PATH, override=True)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")

if not GOOGLE_API_KEY:
    raise ValueError("Google API key is missing")


llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL,
    google_api_key=GOOGLE_API_KEY,
    temperature=0
)