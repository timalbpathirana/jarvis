import os
from typing import List
import tempfile

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document

import config


class DocumentProcessor:
    """Class to handle PDF document processing using LangChain"""
    
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def process_pdf(self, file_path: str) -> List[Document]:
        """
        Process a PDF file and split it into chunks
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            List of Document objects with text chunks
        """
        try:
            # Load the PDF
            loader = PyPDFLoader(file_path)
            documents = loader.load()
            
            # Split the document into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            print(f"Processed PDF with {len(chunks)} chunks")
            return chunks
        except Exception as e:
            print(f"Error processing PDF: {e}")
            raise
    
    def process_pdf_from_upload(self, file_content: bytes, filename: str) -> List[Document]:
        """
        Process an uploaded PDF file and split it into chunks
        
        Args:
            file_content: Binary content of the PDF file
            filename: Name of the uploaded file
            
        Returns:
            List of Document objects with text chunks
        """
        try:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(file_content)
                temp_path = temp_file.name
            
            # Process the PDF
            chunks = self.process_pdf(temp_path)
            
            # Delete the temporary file
            os.unlink(temp_path)
            
            # Add metadata about the source file
            for chunk in chunks:
                if not chunk.metadata:
                    chunk.metadata = {}
                chunk.metadata["source"] = filename
            
            return chunks
        except Exception as e:
            print(f"Error processing uploaded PDF: {e}")
            raise 