import unittest
import os
import json
from fastapi.testclient import TestClient

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api import app


class TestJarvisAPI(unittest.TestCase):
    """Test cases for the JARVIS API endpoints"""

    def setUp(self):
        self.client = TestClient(app)
    
    def test_root_endpoint(self):
        """Test the root endpoint returns the correct message"""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "JARVIS RAG API is running"})
    
    def test_query_endpoint_validation(self):
        """Test query endpoint validates request data"""
        # Test with empty request
        response = self.client.post("/query", json={})
        self.assertEqual(response.status_code, 422)
        
        # Test with invalid key
        response = self.client.post("/query", json={"question": "What projects has Timal worked on?"})
        self.assertEqual(response.status_code, 422)
        
        # Test with null value
        response = self.client.post("/query", json={"query": None})
        self.assertEqual(response.status_code, 422)
    
    def test_upload_endpoint_validation(self):
        """Test upload endpoint validates file type"""
        # Create a text file for testing
        with open("test_file.txt", "w") as f:
            f.write("This is a test file")
        
        # Test with text file (should fail)
        with open("test_file.txt", "rb") as f:
            response = self.client.post("/upload", files={"file": ("test_file.txt", f, "text/plain")})
            self.assertEqual(response.status_code, 400)
            self.assertIn("Only PDF files are supported", response.json()["detail"])
        
        # Clean up
        if os.path.exists("test_file.txt"):
            os.remove("test_file.txt")


if __name__ == "__main__":
    unittest.main() 