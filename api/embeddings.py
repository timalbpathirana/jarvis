from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
import config

def get_embeddings_model():
    """
    Returns the embeddings model based on config settings.
    
    Currently using llama-text-embed-v2 via OpenAI.
    """
    try:
        # Initialize OpenAI embedding model
        embeddings = OpenAIEmbeddings(
            model=config.EMBEDDING_MODEL,
            openai_api_key=config.OPENAI_API_KEY,
            dimensions=config.EMBEDDING_DIMENSION,
        )
        return embeddings
    except Exception as e:
        print(f"Error initializing OpenAI embeddings: {e}")
        
        # Fallback to local embedding model if OpenAI fails
        return HuggingFaceEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            model_kwargs={"device": "cpu"}
        ) 