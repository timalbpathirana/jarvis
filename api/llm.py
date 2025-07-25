from typing import List
from langchain.chains import RetrievalQA
from langchain_openai import ChatOpenAI
from langchain_core.documents import Document

import config
from vector_store import VectorStoreManager


class LLMManager:
    """Class to manage LLM interactions with OpenAI"""
    
    def __init__(self, vector_store_manager: VectorStoreManager = None):
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model=config.LLM_MODEL,
            temperature=config.LLM_TEMPERATURE,
            api_key=config.OPENAI_API_KEY
        )
        
        self.vector_store_manager = vector_store_manager or VectorStoreManager()
    
    def generate_response_with_rag(self, query: str, conversation_history=None, system_prompt=None) -> dict:
        """
        Generate a response using RAG (Retrieval Augmented Generation)
        
        Args:
            query: User query
            conversation_history: List of previous messages in the conversation
            system_prompt: System prompt to define the assistant's behavior
            
        Returns:
            Dictionary with the response and supporting documents
        """
        try:
            # Set defaults if not provided
            conversation_history = conversation_history or []
            system_prompt = system_prompt or "You're JARVIS, a personal AI assistant for Timal Pathirana."
            
            # Retrieve relevant documents
            docs = self.vector_store_manager.similarity_search(query, k=4)
            
            # Create context from retrieved documents
            context = self._create_context_from_docs(docs)
            
            # Create messages format for the chat model
            messages = [
                {"role": "system", "content": self._create_system_prompt(system_prompt, context)}
            ]
            
            # Add conversation history
            for message in conversation_history:
                messages.append(message)
                
            # Add the current query
            messages.append({"role": "user", "content": query})
            
            # Generate response using OpenAI
            response = self.llm.invoke(messages)
            
            # Extract sources for citation
            sources = self._extract_sources(docs)
            
            return {
                "answer": response.content,
                "sources": sources,
                "context_used": True
            }
            
        except Exception as e:
            print(f"Error generating response: {e}")
            
            # Fallback to no-context response
            messages = [
                {"role": "system", "content": "You're JARVIS, a personal AI assistant for Timal Pathirana."}
            ]
            
            # Add conversation history
            if conversation_history:
                for message in conversation_history:
                    messages.append(message)
            
            # Add the current query
            messages.append({"role": "user", "content": query})
            
            response = self.llm.invoke(messages)
            
            return {
                "answer": response.content,
                "sources": [],
                "context_used": False,
                "error": str(e)
            }
            
    def _create_context_from_docs(self, docs: List[Document]) -> str:
        """Create context string from retrieved documents"""
        context_parts = []
        
        for i, doc in enumerate(docs):
            context_parts.append(f"Document {i+1}:\n{doc.page_content}")
        
        return "\n\n".join(context_parts)
    
    def _create_prompt(self, query: str, context: str) -> str:
        """Create a prompt for the LLM with context and query"""
        return (
            f"You're JARVIS, a personal AI assistant for Timal Pathirana. "
            f"You have access to the following information about Timal:\n\n"
            f"{context}\n\n"
            f"Based on the above information, please respond to the user's query: {query}\n\n"
            f"If the information provided doesn't contain the answer, you can respond based on "
            f"your general knowledge, but make it clear that you're doing so. "
            f"Use a conversational, helpful tone similar to the JARVIS AI from Iron Man."
        )
    
    def _create_system_prompt(self, system_prompt: str, context: str) -> str:
        """Create a system prompt with context"""
        return (
            f"{system_prompt}\n\n"
            f"You have access to the following information about Timal:\n\n"
            f"{context}\n\n"
            f"If the information provided doesn't contain the answer, you can respond based on "
            f"your general knowledge, but make it clear that you're doing so. "
            f"Use a conversational, helpful tone similar to the JARVIS AI from Iron Man."
        )
    
    def _extract_sources(self, docs: List[Document]) -> List[dict]:
        """Extract source information from documents for citation"""
        sources = []
        for doc in docs:
            if doc.metadata and "source" in doc.metadata:
                source = {
                    "title": doc.metadata.get("source", "Unknown"),
                    "snippet": doc.page_content[:100] + "..." if len(doc.page_content) > 100 else doc.page_content
                }
                
                # Add page number if available
                if "page" in doc.metadata:
                    source["page"] = doc.metadata["page"]
                
                sources.append(source)
        
        return sources 