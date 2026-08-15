import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("API Key:", api_key)

genai.configure(api_key=api_key)

for model in genai.list_models():
    print(model.name)