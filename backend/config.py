import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Pinecone Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "supportmate-index")
PINECONE_HOST = os.getenv("PINECONE_HOST", "https://supportmate-index-muxot6x.svc.aped-4627-b74a.pinecone.io")

# Vector Embedding Configuration
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1024

# LLM Configuration
LLM_MODEL = "gpt-4o"
LLM_TEMPERATURE = 0.7

# API Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200 