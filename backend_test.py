
import requests
import sys
import time
from datetime import datetime

class AIPhotoshootAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.uploaded_image_url = None
        self.job_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        
        if endpoint.startswith('api/'):
            url = f"{self.base_url}/{endpoint}"
        else:
            url = f"{self.base_url}/api/{endpoint}"
            
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                    return False, response.json()
                except:
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )

    def test_get_all_catalogs(self):
        """Test getting all catalogs"""
        return self.run_test(
            "Get All Catalogs",
            "GET",
            "catalogs",
            200
        )

    def test_get_catalog_by_id(self, catalog_id=1):
        """Test getting a specific catalog by ID"""
        return self.run_test(
            f"Get Catalog ID {catalog_id}",
            "GET",
            f"catalogs/{catalog_id}",
            200
        )

    def test_get_catalogs_by_category(self, category="casual"):
        """Test getting catalogs by category"""
        return self.run_test(
            f"Get Catalogs by Category '{category}'",
            "GET",
            f"catalogs/category/{category}",
            200
        )

    def test_upload_image(self):
        """Test image upload endpoint with a mock image"""
        # Create a simple test image
        import io
        from PIL import Image
        
        # Create a test image in memory
        img = Image.new('RGB', (100, 100), color = 'red')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        files = {'file': ('test_image.jpg', img_byte_arr, 'image/jpeg')}
        
        success, response = self.run_test(
            "Upload Image",
            "POST",
            "upload",
            200,
            files=files
        )
        
        if success and 'url' in response:
            self.uploaded_image_url = response['url']
            print(f"Uploaded image URL: {self.uploaded_image_url}")
        
        return success, response

    def test_process_image(self, catalog_id=1):
        """Test processing endpoint"""
        if not self.uploaded_image_url:
            print("❌ No uploaded image URL available. Upload test must run first.")
            return False, {}
        
        data = {
            "catalog_id": catalog_id,
            "user_image_url": self.uploaded_image_url
        }
        
        success, response = self.run_test(
            "Process Image",
            "POST",
            "process",
            200,
            data=data
        )
        
        if success and 'job_id' in response:
            self.job_id = response['job_id']
            print(f"Processing job ID: {self.job_id}")
        
        return success, response

    def test_get_processing_status(self):
        """Test getting processing status"""
        if not self.job_id:
            print("❌ No job ID available. Process test must run first.")
            return False, {}
        
        # Wait a moment to simulate processing time
        print("Waiting for processing to complete...")
        time.sleep(2)
        
        return self.run_test(
            "Get Processing Status",
            "GET",
            f"process/{self.job_id}",
            200
        )

    def test_delete_processing_job(self):
        """Test deleting a processing job"""
        if not self.job_id:
            print("❌ No job ID available. Process test must run first.")
            return False, {}
        
        return self.run_test(
            "Delete Processing Job",
            "DELETE",
            f"process/{self.job_id}",
            200
        )

    def test_get_api_stats(self):
        """Test getting API stats"""
        return self.run_test(
            "Get API Stats",
            "GET",
            "stats",
            200
        )

def main():
    # Get backend URL from environment
    import os
    
    # Use the backend URL from the frontend .env file
    backend_url = "https://35d29ac4-7a8f-4000-9438-3f7fb69f6c81.preview.emergentagent.com"
    
    print(f"Testing API at: {backend_url}")
    
    # Setup tester
    tester = AIPhotoshootAPITester(backend_url)
    
    # Run tests
    tester.test_health_check()
    success, catalogs_response = tester.test_get_all_catalogs()
    
    if success:
        catalogs = catalogs_response.get('catalogs', [])
        print(f"Found {len(catalogs)} catalogs")
        
        # Test getting a specific catalog
        if catalogs:
            catalog_id = catalogs[0]['id']
            tester.test_get_catalog_by_id(catalog_id)
    
    # Test category filtering
    tester.test_get_catalogs_by_category("casual")
    tester.test_get_catalogs_by_category("streetwear")
    tester.test_get_catalogs_by_category("all")
    
    # Test upload and processing flow
    upload_success, _ = tester.test_upload_image()
    if upload_success:
        process_success, _ = tester.test_process_image()
        if process_success:
            tester.test_get_processing_status()
            tester.test_delete_processing_job()
    
    # Test API stats
    tester.test_get_api_stats()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
