from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Request, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
import uvicorn
import os

from vector_store import VectorStoreManager
from llm import LLMManager

# Create FastAPI app
app = FastAPI(
    title="JARVIS RAG API",
    description="API for RAG-enabled document search and question answering"
)

# Security - API key authentication
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Get API key from environment variable
API_KEY = os.environ.get("JARVIS_API_KEY")
if not API_KEY:
    # For development, use a default key if not set
    # In production, this should be properly set
    API_KEY = "dev_api_key_replace_in_production"

# Authentication dependency
async def verify_api_key(api_key: str = Depends(api_key_header)):
    if not API_KEY:
        # API key validation disabled for dev if not configured
        return True
        
    if api_key != API_KEY:
        raise HTTPException(
            status_code=403, 
            detail="Invalid API key"
        )
    return True

# Add CORS middleware with more restrictive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Add your frontend URL here (e.g., https://your-app.vercel.app)
        # For development
        "http://localhost:5173",
        "http://localhost:3000",
        "https://jarvisui.vercel.app",
        "https://inside-my-mind.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Initialize components
vector_store_manager = VectorStoreManager()
llm_manager = LLMManager(vector_store_manager=vector_store_manager)


# Models
class QueryRequest(BaseModel):
    query: str
    conversation_history: List[Dict[str, str]] = []  # [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    system_prompt: str = """
You are JARVIS, a dedicated AI assistant created by Timal Pathirana.

Your role is to assist recruiters, hiring managers, and curious minds in learning more about Timal — including his career, technical skills, education, professional projects, values, and personal development journey.

Use the RAG context to retrieve accurate, relevant information from Timal's background documents. Always respond with clarity, professionalism, and a warm, helpful tone.

Your scope includes:
- Timal's work experience, projects, and achievements  
- His education and learning path  
- His engineering philosophy, creativity, and team values  
- Personal projects and side ventures he has built  
- Career growth, certifications, and skills  

Do **not** answer questions unrelated to Timal's professional or personal journey.  
If a question falls outside your scope, reply:

> "I'm here to assist with questions about Timal's career, projects, and journey. Let's keep it focused on that. 😊"

🧠 Keep every response **concise and focused** — no fluff, no filler. Assume the reader is busy.  
Avoid long explanations or redundant praise. Just answer directly with insight and relevance.

Always speak as JARVIS — Timal's personal AI assistant — and never refer to yourself as an LLM or generic AI.
"""


class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    context_used: bool


class UploadResponse(BaseModel):
    message: str
    documents_added: int
    filename: str


@app.get("/api")
async def root():
    return {"message": "JARVIS RAG API is running"}


@app.post("/api/query", dependencies=[Depends(verify_api_key)])
async def query_documents(request: QueryRequest):
    """
    Query the RAG system with a question
    """
    try:
        response = llm_manager.generate_response_with_rag(
            request.query,
            conversation_history=request.conversation_history,
            system_prompt=request.system_prompt
        )
        
        return QueryResponse(
            answer=response["answer"],
            sources=response["sources"],
            context_used=response["context_used"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


@app.post("/api/upload", dependencies=[Depends(verify_api_key)])
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document to be processed and stored in the vector database
    """
    from document_processor import DocumentProcessor
    document_processor = DocumentProcessor()
    
    # Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read file content
    file_content = await file.read()
    
    try:
        # Process the document
        chunks = document_processor.process_pdf_from_upload(file_content, file.filename)
        
        # Add to vector store
        documents_added = vector_store_manager.add_documents(chunks)
        
        return UploadResponse(
            message="Document uploaded and processed successfully",
            documents_added=documents_added,
            filename=file.filename
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@app.post("/api/clear", dependencies=[Depends(verify_api_key)])
async def clear_vector_store():
    """
    Clear all vectors from the store (admin use only)
    """
    try:
        success = vector_store_manager.delete_all()
        
        if success:
            return {"message": "Vector store cleared successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear vector store")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing vector store: {str(e)}")

# For local development
if __name__ == "__main__":
    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True) 