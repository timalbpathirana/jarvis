from typing import List, Optional

from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document

import config
from embeddings import get_embeddings_model


class VectorStoreManager:
    """Class to manage Pinecone vector store operations"""
    
    def __init__(self):
        self.pc = None
        self.index = None
        self.vector_store = None
        self.embeddings = get_embeddings_model()
        
        # Initialize Pinecone
        self._initialize_pinecone()
    
    def _initialize_pinecone(self):
        """Initialize the Pinecone client and get the index"""
        try:
            self.pc = Pinecone(api_key=config.PINECONE_API_KEY)
            
            # Check if index exists, if not create it
            index_list = [index.name for index in self.pc.list_indexes()]
            
            if config.PINECONE_INDEX_NAME not in index_list:
                print(f"Creating new Pinecone index: {config.PINECONE_INDEX_NAME}")
                self.pc.create_index(
                    name=config.PINECONE_INDEX_NAME,
                    dimension=config.EMBEDDING_DIMENSION,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud=config.PINECONE_CLOUD,
                        region=config.PINECONE_REGION
                    )
                )
            
            # Get the index
            self.index = self.pc.Index(config.PINECONE_INDEX_NAME)
            
            # Initialize the vector store
            self.vector_store = PineconeVectorStore(
                index=self.index,
                embedding=self.embeddings,
                text_key="text"
            )
            
            print(f"Successfully initialized Pinecone index: {config.PINECONE_INDEX_NAME}")
            
        except Exception as e:
            print(f"Error initializing Pinecone: {e}")
            raise
    
    def add_documents(self, documents: List[Document]) -> int:
        """
        Add documents to the vector store
        
        Args:
            documents: List of Document objects to add
            
        Returns:
            Number of documents added
        """
        try:
            ids = self.vector_store.add_documents(documents)
            print(f"Added {len(ids)} documents to Pinecone")
            return len(ids)
        except Exception as e:
            print(f"Error adding documents to Pinecone: {e}")
            raise
    
    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """
        Perform similarity search on the vector store
        
        Args:
            query: Query text to search for
            k: Number of results to return
            
        Returns:
            List of Document objects most similar to the query
        """
        try:
            docs = self.vector_store.similarity_search(query, k=k)
            return docs
        except Exception as e:
            print(f"Error performing similarity search: {e}")
            raise
    
    def delete_all(self) -> bool:
        """
        Delete all vectors from the store
        
        Returns:
            True if successful
        """
        try:
            self.index.delete(delete_all=True)
            print("Deleted all vectors from Pinecone")
            return True
        except Exception as e:
            print(f"Error deleting vectors from Pinecone: {e}")
            raise 