import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from services.auth import verify_jwt
from services.supabase_client import get_supabase

router = APIRouter(prefix="/products", tags=["products"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = {"application/pdf", "text/plain"}
ALLOWED_EXTENSIONS = {".pdf", ".txt"}


@router.get("")
async def list_products(user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]
    try:
        db = get_supabase()
        result = (
            db.table("user_products")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .execute()
        )
        return result.data or []
    except Exception:
        return []


@router.post("")
async def upload_product(
    name: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(None),
    user: dict = Depends(verify_jwt),
):
    user_id = user["user_id"]

    # Validate name
    name = name.strip()
    if not name or len(name) > 200:
        raise HTTPException(status_code=400, detail="Name must be 1–200 characters")

    # Validate description length
    description = description.strip()[:2000]

    processed_content = description

    if file:
        # Validate file extension
        filename = file.filename or ""
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed")

        # Validate content type
        if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Read with size limit
        content = await file.read(MAX_FILE_SIZE + 1)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large — 5 MB max")

        if ext == ".pdf":
            try:
                import pdfplumber
                import io
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    processed_content = "\n".join(
                        page.extract_text() or "" for page in pdf.pages
                    )
            except Exception:
                raise HTTPException(status_code=422, detail="Could not read PDF — try a text file")
        else:
            try:
                processed_content = content.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(status_code=422, detail="File must be valid UTF-8 text")

    product_id = str(uuid.uuid4())
    try:
        db = get_supabase()
        db.table("user_products").insert({
            "id": product_id,
            "user_id": user_id,
            "name": name,
            "description": description,
            "processed_content": processed_content[:10000],
            "is_active": True,
        }).execute()
        return {"id": product_id, "name": name}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save product")


@router.delete("/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(verify_jwt)):
    user_id = user["user_id"]
    try:
        db = get_supabase()
        db.table("user_products").update({"is_active": False}).eq("id", product_id).eq("user_id", user_id).execute()
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete product")
