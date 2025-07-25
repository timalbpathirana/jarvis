# JARVIS RAG Backend API

This backend provides a RAG (Retrieval Augmented Generation) API for the JARVIS UI, allowing you to upload PDF documents about yourself and query them with AI-powered responses.

## Features

- PDF document processing and vectorization
- Pinecone vector storage for efficient retrieval
- OpenAI-powered response generation
- FastAPI endpoints for document upload and querying

## Setup Instructions

### 1. Install Requirements

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Copy the example environment file and update it with your API keys:

```bash
cp env.example .env
```

Then edit the `.env` file with your API keys:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=supportmate-index
PINECONE_HOST=https://supportmate-index-muxot6x.svc.aped-4627-b74a.pinecone.io
```

### 3. Run the API

```bash
python api.py
```

The API will be available at `http://localhost:8000`.

### 4. API Documentation

Once running, you can access the interactive API documentation at:

```
http://localhost:8000/docs
```

## API Endpoints

### Upload Documents

Upload PDF documents to be processed and added to the vector database:

```
POST /upload
```

This endpoint accepts multipart form data with a file field containing a PDF document.

### Query for Answers

Ask questions about the uploaded documents:

```
POST /query
```

This endpoint accepts a JSON body with a `query` field:

```json
{
  "query": "What projects has Timal worked on?"
}
```

### Clear Vector Store

Clear all vectors from the store:

```
POST /clear
```

## Integration with JARVIS UI

The backend API can be integrated with the JARVIS UI to provide intelligent responses based on your uploaded documents.

### Example Frontend Integration Code

```typescript
// Example TypeScript code to call the backend API
const uploadDocument = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://localhost:8000/upload', {
    method: 'POST',
    body: formData,
  })

  return await response.json()
}

const queryJarvis = async (query: string) => {
  const response = await fetch('http://localhost:8000/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  return await response.json()
}
```

## Architecture

The backend uses the following components:

1. **DocumentProcessor**: Processes PDF documents and splits them into chunks
2. **VectorStoreManager**: Manages the Pinecone vector store for document embeddings
3. **LLMManager**: Handles interactions with the OpenAI API for generating responses
4. **FastAPI**: Provides HTTP endpoints for the frontend to interact with

## Customization

You can customize the following settings in `config.py`:

- `LLM_MODEL`: The OpenAI model to use for generating responses
- `LLM_TEMPERATURE`: Temperature parameter for response generation
- `CHUNK_SIZE`: Size of text chunks for document processing
- `CHUNK_OVERLAP`: Overlap between text chunks
- `EMBEDDING_MODEL`: Model to use for generating embeddings
- `EMBEDDING_DIMENSION`: Dimension of the embedding vectors
