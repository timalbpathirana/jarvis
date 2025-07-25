# JARVIS Project

JARVIS (Just A Rather Very Intelligent System) is an interactive AI assistant interface inspired by Iron Man's JARVIS. This project showcases a holographic-inspired UI with RAG-powered AI capabilities to answer questions about professional background, skills, and projects.

![JARVIS Interface](https://via.placeholder.com/800x400?text=JARVIS+Interface)

## Quick Start

### Prerequisites

- Node.js 16+
- Python 3.10+
- OpenAI API key
- Pinecone API key

### Frontend Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Configure environment:
   Create `.env` file with:

   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. Run development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Install dependencies:

   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Configure environment:
   Create `.env` file based on `env.example`:

   ```
   OPENAI_API_KEY=your_openai_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_ENVIRONMENT=us-west4-gcp
   ```

3. Run development server:
   ```
   cd backend
   uvicorn api:app --reload
   ```

## Project Structure

```
├── src/
│   ├── components/      # React components including JarvisUI
│   ├── services/        # API services
│   └── ...
├── backend/
│   ├── api.py           # FastAPI endpoints
│   ├── llm.py           # LLM integration
│   ├── vector_store.py  # Vector database management
│   └── ...
└── ...
```

## Documentation

For complete documentation, see the [JARVIS_Project_Documentation.pdf](./JARVIS_Project_Documentation.pdf) file, which includes:

- Technical stack details
- Architecture overview
- RAG implementation
- Development process with CursorAI
- API endpoints
- Troubleshooting guide

## Features

- Holographic-inspired UI with sci-fi elements
- RAG-powered question answering
- Interactive information panels
- Real-time AI chat interface
- Animated bootup sequence
- Responsive design

## License

MIT License

## Acknowledgments

This project was developed with the assistance of CursorAI.
