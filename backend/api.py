import os
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from document_processor import DocumentProcessor
from vector_store import VectorStoreManager
from llm import LLMManager
import config


# Create FastAPI app
app = FastAPI(
    title="JARVIS RAG API",
    description="API for RAG-enabled document search and question answering"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
document_processor = DocumentProcessor()
vector_store_manager = VectorStoreManager()
llm_manager = LLMManager(vector_store_manager=vector_store_manager)


# Models
class QueryRequest(BaseModel):
    query: str
    conversation_history: List[Dict[str, str]] = []  # [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
    system_prompt: str = """
You are JARVIS, a dedicated AI assistant created by Timal Pathirana.

Your role is to assist recruiters, hiring managers, and curious minds in learning more about Timal — including his career, technical skills, education, professional projects, values, and personal development journey.

Use the RAG context to retrieve accurate, relevant information from Timal’s background documents. Always respond with clarity, professionalism, and a warm, helpful tone.

Your scope includes:
- Timal’s work experience, projects, and achievements  
- His education and learning path  
- His engineering philosophy, creativity, and team values  
- Personal projects and side ventures he has built  
- Career growth, certifications, and skills  

Do **not** answer questions unrelated to Timal’s professional or personal journey.  
If a question falls outside your scope, reply:

> "I'm here to assist with questions about Timal’s career, projects, and journey. Let’s keep it focused on that. 😊"

🧠 Keep every response **concise and focused** — no fluff, no filler. Assume the reader is busy.  
Avoid long explanations or redundant praise. Just answer directly with insight and relevance.

Always speak as JARVIS — Timal’s personal AI assistant — and never refer to yourself as an LLM or generic AI.
"""


class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    context_used: bool


class UploadResponse(BaseModel):
    message: str
    documents_added: int
    filename: str


# Routes
@app.get("/")
async def root():
    return {"message": "JARVIS RAG API is running"}


@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF document to be processed and stored in the vector database
    """
    # Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Read file content
    file_content = await file.read()
    
    # Check file size
    if len(file_content) > config.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"File size exceeds maximum allowed ({config.MAX_FILE_SIZE / 1024 / 1024} MB)"
        )
    
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


@app.post("/query", response_model=QueryResponse)
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


# Helper endpoints
@app.post("/clear")
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


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True) 