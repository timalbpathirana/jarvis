import os
from dotenv import load_dotenv

# Try to load environment variables from .env file if it exists (for local development)
load_dotenv()

# Environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT")
PINECONE_INDEX = os.environ.get("PINECONE_INDEX") or "jarvis-knowledge"

# Constants for document processing
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

# Validate environment variables
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY environment variable is not set")

if not PINECONE_ENVIRONMENT:
    raise ValueError("PINECONE_ENVIRONMENT environment variable is not set") 