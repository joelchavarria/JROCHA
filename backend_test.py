#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class JewelryAPITester:
    def __init__(self, base_url="https://boutique-joyas.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.errors = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                print(f"❌ Failed - {error_msg}")
                self.errors.append(f"{name}: {error_msg}")
                try:
                    error_detail = response.json()
                    print(f"   Error detail: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                return {}

        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(f"❌ Failed - {error_msg}")
            self.errors.append(f"{name}: {error_msg}")
            return {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_seed_data(self):
        """Seed the database with initial data"""
        return self.run_test("Seed Data", "POST", "seed", 200)

    def test_categories(self):
        """Test categories endpoints"""
        # Get categories
        categories = self.run_test("Get Categories", "GET", "categories", 200)
        
        # Create a new category
        new_category = {
            "name": "Test Category",
            "slug": "test-category",
            "image": "https://example.com/test.jpg",
            "description": "Test category description"
        }
        created = self.run_test("Create Category", "POST", "categories", 200, new_category)
        
        # Delete test category
        if created and 'id' in created:
            self.run_test("Delete Category", "DELETE", f"categories/{created['id']}", 200)
        
        return categories

    def test_products(self):
        """Test products endpoints"""
        # Get all products
        products = self.run_test("Get All Products", "GET", "products", 200)
        
        # Get featured products
        featured = self.run_test("Get Featured Products", "GET", "products", 200, params={"featured": True})
        
        # Get products by category
        anillos = self.run_test("Get Anillos Products", "GET", "products", 200, params={"category": "anillos"})
        
        # Test individual product
        if products and len(products) > 0:
            product_id = products[0]['id']
            product = self.run_test("Get Product by ID", "GET", f"products/{product_id}", 200)
        
        # Create a test product
        new_product = {
            "name": "Test Product",
            "description": "Test product description",
            "price": 100.00,
            "category_slug": "anillos",
            "images": ["https://example.com/test-product.jpg"],
            "featured": False,
            "in_stock": True
        }
        created_product = self.run_test("Create Product", "POST", "products", 200, new_product)
        
        # Update product
        if created_product and 'id' in created_product:
            update_data = {"price": 150.00, "featured": True}
            self.run_test("Update Product", "PUT", f"products/{created_product['id']}", 200, update_data)
            
            # Delete test product
            self.run_test("Delete Product", "DELETE", f"products/{created_product['id']}", 200)
        
        return products

    def test_orders(self):
        """Test orders endpoints"""
        # Get all orders
        orders = self.run_test("Get All Orders", "GET", "orders", 200)
        
        # Create a test order
        test_order = {
            "customer_name": "John Doe",
            "customer_phone": "88888888",
            "customer_email": "john@example.com",
            "customer_address": "Test Address 123",
            "items": [
                {
                    "product_id": "test-id",
                    "name": "Test Product",
                    "price": 100.00,
                    "quantity": 1,
                    "image": "https://example.com/test.jpg"
                }
            ],
            "total": 100.00,
            "notes": "Test order notes"
        }
        created_order = self.run_test("Create Order", "POST", "orders", 200, test_order)
        
        # Update order status
        if created_order and 'id' in created_order:
            self.run_test("Update Order Status", "PUT", f"orders/{created_order['id']}/status", 200, params={"status": "confirmed"})
        
        return orders

    def test_settings(self):
        """Test settings endpoints"""
        # Get settings
        settings = self.run_test("Get Settings", "GET", "settings", 200)
        
        # Update settings
        if settings:
            updated_settings = {
                "whatsapp_number": "89953348",
                "bank_info": {
                    "bank_name": "BAC Credomatic",
                    "account_number": "1234567890",
                    "account_holder": "Lumina & Co.",
                    "cedula": "123456789"
                }
            }
            self.run_test("Update Settings", "PUT", "settings", 200, updated_settings)
        
        return settings

def main():
    print("🧪 Starting Jewelry API Tests")
    print("=" * 50)
    
    tester = JewelryAPITester()
    
    # Test in logical order
    print("\n📡 Testing basic connectivity...")
    tester.test_root_endpoint()
    
    print("\n🌱 Seeding data...")
    tester.test_seed_data()
    
    print("\n📂 Testing categories...")
    tester.test_categories()
    
    print("\n💍 Testing products...")
    tester.test_products()
    
    print("\n🛒 Testing orders...")
    tester.test_orders()
    
    print("\n⚙️ Testing settings...")
    tester.test_settings()
    
    # Print final results
    print(f"\n{'='*50}")
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.errors:
        print(f"\n❌ Failed tests:")
        for error in tester.errors:
            print(f"  • {error}")
    else:
        print("\n✅ All tests passed!")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"🎯 Success rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())