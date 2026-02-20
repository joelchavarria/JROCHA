from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============== MODELS ==============

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image: str
    description: Optional[str] = ""

class CategoryCreate(BaseModel):
    name: str
    slug: str
    image: str
    description: Optional[str] = ""

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category_slug: str
    images: List[str]
    featured: bool = False
    in_stock: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_slug: str
    images: List[str]
    featured: bool = False
    in_stock: bool = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_slug: Optional[str] = None
    images: Optional[List[str]] = None
    featured: Optional[bool] = None
    in_stock: Optional[bool] = None

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: str

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = ""
    customer_address: str
    items: List[CartItem]
    total: float
    notes: Optional[str] = ""

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_phone: str
    customer_email: str = ""
    customer_address: str
    items: List[CartItem]
    total: float
    notes: str = ""
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BankInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    bank_name: str = "BAC Credomatic"
    account_number: str = "Configurar número de cuenta"
    account_holder: str = "Lumina & Co."
    cedula: str = "Configurar cédula"

class StoreSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    whatsapp_number: str = "89953348"
    bank_info: BankInfo = Field(default_factory=BankInfo)

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Lumina & Co. Jewelry API"}

# ---- Categories ----
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate):
    category = Category(**input.model_dump())
    doc = category.model_dump()
    await db.categories.insert_one(doc)
    return category

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# ---- Products ----
@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None)
):
    query = {}
    if category:
        query["category_slug"] = category
    if featured is not None:
        query["featured"] = featured
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.post("/products", response_model=Product)
async def create_product(input: ProductCreate):
    product = Product(**input.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if update_data:
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ---- Orders ----
@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate):
    order = Order(**input.model_dump())
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    # Convert CartItem objects to dicts
    doc['items'] = [item.model_dump() if hasattr(item, 'model_dump') else item for item in doc['items']]
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for o in orders:
        if isinstance(o.get('created_at'), str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...)):
    result = await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

# ---- Store Settings ----
@api_router.get("/settings", response_model=StoreSettings)
async def get_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        default = StoreSettings()
        await db.settings.insert_one(default.model_dump())
        return default
    return StoreSettings(**settings)

@api_router.put("/settings", response_model=StoreSettings)
async def update_settings(input: StoreSettings):
    await db.settings.update_one({}, {"$set": input.model_dump()}, upsert=True)
    return input

# ---- Seed Data ----
@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing = await db.categories.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    # Categories
    categories = [
        {"id": str(uuid.uuid4()), "name": "Anillos", "slug": "anillos", "image": "https://images.unsplash.com/photo-1758995115445-c91788f5aa24?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBkaWFtb25kJTIwcmluZyUyMGdvbGQlMjBibGFjayUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzcxNjA3MjI1fDA&ixlib=rb-4.1.0&q=85", "description": "Elegantes anillos de oro y diamantes"},
        {"id": str(uuid.uuid4()), "name": "Collares", "slug": "collares", "image": "https://images.unsplash.com/photo-1762195024277-b3e9f3bda4dd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwzfHxlbGVnYW50JTIwZGlhbW9uZCUyMG5lY2tsYWNlJTIwbW9kZWwlMjBmYXNoaW9ufGVufDB8fHx8MTc3MTYwNzIyNnww&ixlib=rb-4.1.0&q=85", "description": "Collares exclusivos para toda ocasión"},
        {"id": str(uuid.uuid4()), "name": "Pulseras", "slug": "pulseras", "image": "https://images.unsplash.com/photo-1767921804162-9c55a278768d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBnb2xkJTIwYnJhY2VsZXQlMjBqZXdlbHJ5fGVufDB8fHx8MTc3MTYwNzIyN3ww&ixlib=rb-4.1.0&q=85", "description": "Pulseras artesanales de alta calidad"},
        {"id": str(uuid.uuid4()), "name": "Aretes", "slug": "aretes", "image": "https://images.unsplash.com/photo-1584948555826-600d0ac457c7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHxkaWFtb25kJTIwZWFycmluZ3MlMjBsdXh1cnklMjBjbG9zZSUyMHVwfGVufDB8fHx8MTc3MTYwNzIyOHww&ixlib=rb-4.1.0&q=85", "description": "Aretes que complementan tu estilo"},
        {"id": str(uuid.uuid4()), "name": "Relojes", "slug": "relojes", "image": "https://images.unsplash.com/photo-1768062251819-651433f1108b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjB3cmlzdCUyMHdhdGNoJTIwbWVuJTIwd29tZW58ZW58MHx8fHwxNzcxNjA3MjI4fDA&ixlib=rb-4.1.0&q=85", "description": "Relojes de lujo para él y ella"}
    ]
    await db.categories.insert_many(categories)
    
    # Products
    products = [
        # Anillos
        {"id": str(uuid.uuid4()), "name": "Anillo Solitario Diamante", "description": "Elegante anillo solitario con diamante de 0.5 quilates en oro blanco de 18k", "price": 2500.00, "category_slug": "anillos", "images": ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Anillo Oro Rosa", "description": "Delicado anillo de oro rosa con pequeños diamantes", "price": 1200.00, "category_slug": "anillos", "images": ["https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Anillo Eternidad", "description": "Anillo de eternidad con diamantes alrededor en oro amarillo", "price": 3200.00, "category_slug": "anillos", "images": ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # Collares
        {"id": str(uuid.uuid4()), "name": "Collar Perlas Naturales", "description": "Elegante collar de perlas cultivadas del mar del sur", "price": 1800.00, "category_slug": "collares", "images": ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Collar Cadena Oro", "description": "Cadena fina de oro amarillo 18k estilo veneciano", "price": 850.00, "category_slug": "collares", "images": ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Collar Diamante Solitario", "description": "Collar con colgante de diamante solitario en oro blanco", "price": 2200.00, "category_slug": "collares", "images": ["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # Pulseras
        {"id": str(uuid.uuid4()), "name": "Pulsera Tennis Diamantes", "description": "Pulsera tennis con 3 quilates de diamantes en oro blanco", "price": 4500.00, "category_slug": "pulseras", "images": ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Pulsera Eslabones Oro", "description": "Pulsera de eslabones gruesos en oro amarillo 18k", "price": 1600.00, "category_slug": "pulseras", "images": ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # Aretes
        {"id": str(uuid.uuid4()), "name": "Aretes Diamante Gota", "description": "Aretes colgantes con diamantes en forma de gota", "price": 2800.00, "category_slug": "aretes", "images": ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Aretes Perla Stud", "description": "Aretes clásicos de perla con base de oro", "price": 650.00, "category_slug": "aretes", "images": ["https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Aretes Argolla Oro", "description": "Aretes de argolla medianos en oro amarillo pulido", "price": 480.00, "category_slug": "aretes", "images": ["https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        
        # Relojes
        {"id": str(uuid.uuid4()), "name": "Reloj Clásico Oro", "description": "Reloj elegante con caja de oro y correa de cuero negro", "price": 3800.00, "category_slug": "relojes", "images": ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Reloj Diamantes Dama", "description": "Reloj para dama con bisel de diamantes", "price": 5200.00, "category_slug": "relojes", "images": ["https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    await db.products.insert_many(products)
    
    # Default settings
    settings = StoreSettings()
    await db.settings.insert_one(settings.model_dump())
    
    return {"message": "Data seeded successfully", "categories": len(categories), "products": len(products)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
