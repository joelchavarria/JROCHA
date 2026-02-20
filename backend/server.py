from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt

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
    user_id: Optional[str] = None
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
    account_holder: str = "Joyería Rocha"
    cedula: str = "Configurar cédula"

class StoreSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    store_name: str = "Joyería Rocha"
    location: str = "Granada, Nicaragua"
    whatsapp_number: str = "0050589953348"
    bank_info: BankInfo = Field(default_factory=BankInfo)

# ============== USER & AUTH MODELS ==============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: str
    name: str
    picture: Optional[str] = ""
    role: str = "customer"  # "customer" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: str
    password: str

# Pre-defined admin accounts
ADMIN_ACCOUNTS = {
    "joelchavarria308@gmail.com": {
        "password": "admin123",
        "name": "Joel Chavarría"
    },
    "joyeriarocha99@gmail.com": {
        "password": "adminjrocha123",
        "name": "Joyería Rocha Admin"
    }
}

# ============== AUTH HELPERS ==============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token in cookie or header"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_admin(request: Request) -> User:
    """Require admin authentication"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============== AUTH ROUTES ==============

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process session_id from Emergent Auth and create local session"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    auth_data = auth_response.json()
    email = auth_data["email"]
    name = auth_data["name"]
    picture = auth_data.get("picture", "")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        role = existing_user.get("role", "customer")
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        # Check if this is an admin email
        role = "admin" if email in ADMIN_ACCOUNTS else "customer"
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "role": role
    }

@api_router.post("/auth/admin-login")
async def admin_login(credentials: AdminLogin, response: Response):
    """Admin login with email and password"""
    email = credentials.email.lower()
    password = credentials.password
    
    if email not in ADMIN_ACCOUNTS:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if ADMIN_ACCOUNTS[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Ensure role is admin
        await db.users.update_one({"user_id": user_id}, {"$set": {"role": "admin"}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": ADMIN_ACCOUNTS[email]["name"],
            "picture": "",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": ADMIN_ACCOUNTS[email]["name"],
        "role": "admin"
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user info"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "role": user.role
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Joyería Rocha API"}

# ---- Categories ----
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate, request: Request):
    await require_admin(request)
    category = Category(**input.model_dump())
    doc = category.model_dump()
    await db.categories.insert_one(doc)
    return category

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, request: Request):
    await require_admin(request)
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
async def create_product(input: ProductCreate, request: Request):
    await require_admin(request)
    product = Product(**input.model_dump())
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate, request: Request):
    await require_admin(request)
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
async def delete_product(product_id: str, request: Request):
    await require_admin(request)
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ---- Orders ----
@api_router.post("/orders", response_model=Order)
async def create_order(input: OrderCreate, request: Request):
    # Get user if authenticated
    user = await get_current_user(request)
    
    order = Order(**input.model_dump())
    if user:
        order.user_id = user.user_id
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['items'] = [item.model_dump() if hasattr(item, 'model_dump') else item for item in doc['items']]
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    request: Request,
    status: Optional[str] = Query(None)
):
    """Get orders - admin sees all, users see their own"""
    user = await get_current_user(request)
    
    query = {}
    
    if user and user.role == "admin":
        # Admin can see all orders
        if status:
            query["status"] = status
    elif user:
        # Regular user sees only their orders
        query["user_id"] = user.user_id
        if status:
            query["status"] = status
    else:
        # Not authenticated - return empty
        return []
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for o in orders:
        if isinstance(o.get('created_at'), str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
    return orders

@api_router.get("/orders/my-history")
async def get_my_orders(request: Request):
    """Get current user's order history"""
    user = await require_auth(request)
    
    orders = await db.orders.find(
        {"user_id": user.user_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for o in orders:
        if isinstance(o.get('created_at'), str):
            o['created_at'] = datetime.fromisoformat(o['created_at'])
    
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...), request: Request = None):
    if request:
        await require_admin(request)
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
async def update_settings(input: StoreSettings, request: Request):
    await require_admin(request)
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
        {"id": str(uuid.uuid4()), "name": "Anillos", "slug": "anillos", "image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", "description": "Elegantes anillos de oro y diamantes"},
        {"id": str(uuid.uuid4()), "name": "Collares", "slug": "collares", "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800", "description": "Collares exclusivos para toda ocasión"},
        {"id": str(uuid.uuid4()), "name": "Pulseras", "slug": "pulseras", "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", "description": "Pulseras artesanales de alta calidad"},
        {"id": str(uuid.uuid4()), "name": "Aretes", "slug": "aretes", "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800", "description": "Aretes que complementan tu estilo"},
        {"id": str(uuid.uuid4()), "name": "Relojes", "slug": "relojes", "image": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800", "description": "Relojes de lujo para él y ella"}
    ]
    await db.categories.insert_many(categories)
    
    # Products
    products = [
        {"id": str(uuid.uuid4()), "name": "Anillo Solitario Diamante", "description": "Elegante anillo solitario con diamante de 0.5 quilates en oro blanco de 18k", "price": 2500.00, "category_slug": "anillos", "images": ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Anillo Oro Rosa", "description": "Delicado anillo de oro rosa con pequeños diamantes", "price": 1200.00, "category_slug": "anillos", "images": ["https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Anillo Eternidad", "description": "Anillo de eternidad con diamantes alrededor en oro amarillo", "price": 3200.00, "category_slug": "anillos", "images": ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Collar Perlas Naturales", "description": "Elegante collar de perlas cultivadas del mar del sur", "price": 1800.00, "category_slug": "collares", "images": ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Collar Cadena Oro", "description": "Cadena fina de oro amarillo 18k estilo veneciano", "price": 850.00, "category_slug": "collares", "images": ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Collar Diamante Solitario", "description": "Collar con colgante de diamante solitario en oro blanco", "price": 2200.00, "category_slug": "collares", "images": ["https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Pulsera Tennis Diamantes", "description": "Pulsera tennis con 3 quilates de diamantes en oro blanco", "price": 4500.00, "category_slug": "pulseras", "images": ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Pulsera Eslabones Oro", "description": "Pulsera de eslabones gruesos en oro amarillo 18k", "price": 1600.00, "category_slug": "pulseras", "images": ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Aretes Diamante Gota", "description": "Aretes colgantes con diamantes en forma de gota", "price": 2800.00, "category_slug": "aretes", "images": ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800"], "featured": True, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Aretes Perla Stud", "description": "Aretes clásicos de perla con base de oro", "price": 650.00, "category_slug": "aretes", "images": ["https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
        {"id": str(uuid.uuid4()), "name": "Aretes Argolla Oro", "description": "Aretes de argolla medianos en oro amarillo pulido", "price": 480.00, "category_slug": "aretes", "images": ["https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800"], "featured": False, "in_stock": True, "created_at": datetime.now(timezone.utc).isoformat()},
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
