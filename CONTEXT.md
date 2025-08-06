# Inside My Mind - Technical Context Documentation

## Project Overview

"Inside My Mind" is an interactive AI assistant application called JARVIS (Just A Rather Very Intelligent System), inspired by Iron Man's JARVIS. The application features a holographic-inspired UI with RAG (Retrieval Augmented Generation) powered AI capabilities to answer questions about the creator's (Timal Pathirana) professional background, skills, and projects.

## System Architecture

The project follows a modern client-server architecture with these primary components:

1. **Frontend**: React/TypeScript application with a sci-fi holographic interface
2. **Backend API**: Python FastAPI application that provides RAG capabilities
3. **Vector Database**: Pinecone used for semantic search and retrieval
4. **LLM Integration**: OpenAI's GPT-4 Turbo used for generating responses

### Deployment

The application is deployed on Vercel, utilizing:

- Vercel hosting for the React frontend
- Vercel serverless functions for the Python FastAPI backend
- Pinecone as the cloud vector database
- OpenAI for embeddings and LLM capabilities

## Directory Structure

```
├── src/                 # Frontend React/TypeScript code
│   ├── components/      # React components including JarvisUI
│   ├── pages/           # Page components
│   ├── services/        # API service interfaces
│   ├── utils/           # Utility functions
│   ├── assets/          # Static assets
│   ├── data/            # Data files
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
│
├── api/                 # Backend API (Python FastAPI) - Production
│   ├── index.py         # Main API routes and server
│   ├── llm.py           # LLM integration logic
│   ├── vector_store.py  # Vector database management
│   ├── document_processor.py # PDF document processing
│   ├── embeddings.py    # Embedding model management
│   ├── config.py        # Configuration settings
│   └── requirements.txt # Python dependencies
│
├── backend/             # Backend API (Development version)
│   └── [Same structure as api/]
│
├── public/              # Static public files
└── [Configuration files]
```

## Frontend Technical Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Routing**: React Router v7
- **Icons**: React Icons
- **State Management**: React Hooks (useState, useEffect)

### Key Frontend Components

#### JarvisUI.tsx

The main interface component that includes:

- Interactive holographic panels with information
- Animated bootup sequence
- Realtime chat interface with JARVIS
- Audio visualization effects
- Personalization system based on visitor name

#### jarvisApi.ts

Service layer that handles communication with the backend:

- queryJarvis: Sends user queries to the RAG system
- uploadDocument: Adds documents to the knowledge base
- checkApiStatus: Verifies backend connectivity
- clearVectorStore: Administrative function to clear the database

## Backend Technical Stack

- **Framework**: FastAPI
- **LLM Integration**: LangChain
- **Vector Database**: Pinecone
- **Embedding Models**: OpenAI Embeddings (text-embedding-3-small)
- **LLM**: GPT-4 Turbo
- **PDF Processing**: LangChain's document loaders and text splitters

### Key Backend Components

#### index.py (API Routes)

- `/api/query`: Processes user questions with RAG
- `/api/upload`: Handles PDF document uploads
- `/api/clear`: Administrative endpoint to clear vector storage
- Security middleware for API key authentication and CORS

#### llm.py

LLM management class that:

- Generates responses using RAG with OpenAI
- Creates appropriate prompts with retrieved context
- Includes fallback mechanisms for error handling
- Extracts and formats sources from retrieved documents

#### vector_store.py

Manages the Pinecone vector database:

- Initializes connection to Pinecone
- Adds document chunks to the vector index
- Performs similarity search for relevant content
- Provides administrative functions

#### document_processor.py

Handles PDF document processing:

- Loads PDF files using PyPDFLoader
- Splits documents into chunks with appropriate overlaps
- Adds metadata to document chunks
- Handles uploaded file contents

## Data Flow

1. **User Query Processing**:
   - User submits question through frontend
   - Query is sent to backend API (/api/query)
   - Backend retrieves relevant document chunks from Pinecone
   - LLM generates response with retrieved context
   - Response with sources returned to frontend
   - UI displays answer with cited sources

2. **Document Ingestion**:
   - Admin uploads PDF document
   - Backend processes the PDF into text chunks
   - Text chunks are embedded and stored in Pinecone
   - Confirmation returned to frontend

## Security Features

- **API Key Authentication**: Backend endpoints protected by API key
- **Restricted CORS**: Limited allowed origins
- **Limited Methods**: Only GET and POST methods allowed
- **Environment Variables**: Sensitive credentials stored in environment variables

## Configuration

The system uses environment variables for configuration:

- OpenAI API key
- Pinecone API key and connection settings
- LLM model selection and parameters
- Vector database settings

## Development and Deployment Workflow

### Local Development

- Frontend: `npm run dev` (Vite dev server)
- Backend: `uvicorn index:app --reload` (FastAPI development server)
- Environment variables stored in .env files

### Production Deployment

- Vercel handles both frontend and backend deployment
- API routes are automatically directed to serverless functions
- Static assets are built and optimized during deployment

## RAG Implementation

The Retrieval Augmented Generation system works by:

1. Converting user queries into vector embeddings
2. Finding semantically similar document chunks in Pinecone
3. Combining retrieved context with the user query
4. Using the LLM to generate coherent, accurate responses
5. Including source citations for transparency

The system employs chunk size optimization (512 tokens) with overlap (50 tokens) to maintain context continuity.
