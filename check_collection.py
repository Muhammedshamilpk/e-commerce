from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv(override=True)

llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0
)

try:
    response = llm.invoke("Say hello in one sentence.")
    print("API WORKING!")
    print(response.content)

except Exception as e:
    print("API ERROR:")
    print(e)