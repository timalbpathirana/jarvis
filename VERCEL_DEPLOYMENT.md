# Vercel Deployment Guide for JARVIS

This guide explains how to deploy your JARVIS application (both frontend and backend) using Vercel's platform.

## Project Structure

The project is organized to work with Vercel's deployment model:

- `/api`: Contains Python serverless functions for the backend
- `/src`: Contains React frontend code
- `vercel.json`: Configuration for routing and environment variables

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Pinecone account](https://www.pinecone.io/) (for the vector database)
3. [OpenAI API key](https://platform.openai.com/api-keys)
4. Your project uploaded to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Set Up Environment Variables

In Vercel, you'll need to configure these environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key
- `PINECONE_API_KEY` - Your Pinecone API key
- `PINECONE_CLOUD` - The cloud provider for your serverless index (e.g., "aws")
- `PINECONE_REGION` - The region for your serverless index (e.g., "us-east-1")
- `PINECONE_INDEX_NAME` - Your Pinecone index name (e.g., "jarvis-knowledge")
- `JARVIS_API_KEY` - A secret API key for securing your endpoints (generate a random string)

For the frontend, add these environment variables:

- `VITE_JARVIS_API_KEY` - Should match the backend `JARVIS_API_KEY`

### 2. Deploy to Vercel

1. Log in to your Vercel account
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Select "Vite"
   - Root Directory: Leave as default (/)
   - Build Command: The default "npm run vercel-build" works
   - Output Directory: "dist"
5. Add Environment Variables:
   - Add all variables listed above
6. Click "Deploy"

### 3. Upload Documents to JARVIS

After deployment:

1. You need to upload documents to JARVIS's knowledge base
2. This can be done programmatically or by creating an admin interface
3. Alternatively, you can pre-populate the Pinecone database

## Local Development

To run the project locally:

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies with `npm install`
4. Run the frontend with `npm run dev`
5. For the backend, go to the `/api` directory and run:
   ```
   pip install -r requirements.txt
   python index.py
   ```

## Security Considerations

The application implements several security measures:

1. **API Key Authentication**: All API endpoints are protected by an API key.
2. **Restricted CORS**: Only specified origins can access the API.
3. **Limited Methods**: Only GET and POST methods are allowed.

For production:

- Use a strong, random API key (not the default development key)
- Update the CORS allowed origins to your actual domain
- Consider adding rate limiting for additional protection
- Regularly rotate your API keys

### Generating a Secure API Key

Use this command to generate a secure random API key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Troubleshooting

- **Cold Start Issues**: Serverless functions may have a cold start delay. Consider using Vercel's Edge Functions for reduced latency.
- **Memory Limits**: Be aware of Vercel's memory limits for serverless functions.
- **Timeouts**: RAG operations might exceed the default timeout. Consider optimizing retrieval or using pagination.
- **Authentication Errors**: Check that your API keys match between frontend and backend.

## Architecture

This deployment uses:

1. **Vercel Hosting** for the React frontend
2. **Vercel Serverless Functions** for the Python FastAPI backend
3. **Pinecone** as the vector database
4. **OpenAI** for embeddings and LLM capabilities

All API requests are routed through `/api/*` endpoints, which Vercel automatically directs to the serverless functions in the `/api` directory.
