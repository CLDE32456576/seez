import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import ALLOWED_ORIGINS

from routers import auth, scenarios, calls, card, kb, payments, products

IS_PROD = os.getenv("ENV", "development") == "production"

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="SEEZ API",
    description="AI-powered bilingual sales training platform",
    version="1.0.0",
    # Disable interactive docs in production
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if IS_PROD:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


app.include_router(auth.router)
app.include_router(scenarios.router)
app.include_router(calls.router)
app.include_router(card.router)
app.include_router(kb.router)
app.include_router(payments.router)
app.include_router(products.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SEEZ API"}
