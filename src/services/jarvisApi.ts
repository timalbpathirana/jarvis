// JARVIS API Service
// This service provides methods to interact with the JARVIS RAG backend API

interface QueryResponse {
  answer: string
  sources: Array<{
    title: string
    snippet: string
    page?: number
  }>
  context_used: boolean
}

interface UploadResponse {
  message: string
  documents_added: number
  filename: string
}

// API base URL - points to the API deployed on Vercel
// In development, this can be overridden with an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// API key from environment
const API_KEY = import.meta.env.VITE_JARVIS_API_KEY || ''

// Headers with API key
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Add API key if available
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY
  }

  return headers
}

/**
 * Upload a PDF document to the backend for processing
 */
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const headers: Record<string, string> = {}
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error uploading document')
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading document:', error)
    throw error
  }
}

/**
 * Query the JARVIS backend with a question
 */
export const queryJarvis = async (
  query: string,
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }> = [],
): Promise<QueryResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        query,
        conversation_history: conversationHistory,
      }),
    })

    if (!response.ok) {
      let errorMessage = 'Error querying JARVIS'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch (parseError) {
        // If JSON parsing fails, use status text
        errorMessage = `Error ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from server')
    }

    try {
      return JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse response JSON:', text)
      throw new Error('Invalid response format from server')
    }
  } catch (error) {
    console.error('Error querying JARVIS:', error)
    throw error
  }
}

/**
 * Check if the backend API is available
 */
export const checkApiStatus = async (): Promise<boolean> => {
  try {
    const headers: Record<string, string> = {}
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY
    }

    const response = await fetch(`${API_BASE_URL}/`, {
      headers,
    })
    return response.ok
  } catch (error) {
    console.error('API unavailable:', error)
    return false
  }
}

/**
 * Clear all documents from the vector store
 * Note: This should be restricted in production environments
 */
export const clearVectorStore = async (): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clear`, {
      method: 'POST',
      headers: getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Error clearing vector store')
    }

    return await response.json()
  } catch (error) {
    console.error('Error clearing vector store:', error)
    throw error
  }
}
