import os
from dotenv import load_dotenv

# Try to load environment variables from .env file if it exists (for local development)
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# Pinecone Configuration
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT", "gcp-starter")
PINECONE_INDEX_NAME = os.environ.get("PINECONE_INDEX_NAME", "jarvis-knowledge")
PINECONE_CLOUD = os.environ.get("PINECONE_CLOUD", "aws")
PINECONE_REGION = os.environ.get("PINECONE_REGION", "us-east-1")

# Document Processing
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Constants for document processing
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50

# Validate environment variables
REQUIRED_VARS = [
    "OPENAI_API_KEY",
    "PINECONE_API_KEY",
]

missing_vars = [var for var in REQUIRED_VARS if not globals().get(var)]
if missing_vars:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing_vars)}")

# LLM Configuration
LLM_MODEL = "gpt-4-turbo"
LLM_TEMPERATURE = 0.1

# Embedding model
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1536 