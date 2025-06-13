import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from starlette.requests import Request
from starlette.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize Sentry before any other application imports
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    # Add data like request headers and IP for users, if applicable;
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
    traces_sample_rate=0,
    profile_session_sample_rate=0,
    profile_lifecycle="manual",
)

from app.aitabbble.db import get_db_session
from app.aitabbble.chat import service as chat_service
from app.aitabbble.schema import (
    MessageCreateRequest,
    MessageCreateUpdateResponse,
    MessageListResponse,
    ThreadCreateRequest,
    ThreadUpdateRequest,
    ThreadListResponse,
    ThreadCreateUpdateResponse,
)

from app.aitabbble.config import logger, settings  # noqa: E402
from app.aitabbble.db import create_tables
from app.aitabbble.openai_client import (
    calculate_with_openai,
    parse_result_value,
    stream_chat,
)  # noqa: E402
from app.aitabbble.schema import CalculationRequest, CalculationResponse, ChatRequest  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if settings.environment == "local":
        logger.info("Creating tables...")
        await create_tables()
    yield
    # Shutdown (if needed)


# Initialize FastAPI app
app = FastAPI(
    title="AI Spreadsheet Backend",
    description="Backend service for AI-assisted spreadsheet calculations",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: setup CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate_cell_value(request: CalculationRequest):
    """Calculate a cell value using OpenAI based on the provided formula and spreadsheet context."""
    try:
        # Call OpenAI to calculate the value
        calculated_value = await calculate_with_openai(request)

        # Parse the result into appropriate type
        result = parse_result_value(calculated_value)

        return CalculationResponse(result=result)

    except Exception as e:
        logger.error(f"Error during calculation: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to calculate cell value: {str(e)}"
        )


@app.post("/api/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(stream_chat(request), media_type="text/event-stream")


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "ai-spreadsheet-backend"}


@app.post("/api/thread", response_model=ThreadCreateUpdateResponse)
async def create_thread(
    request: ThreadCreateRequest, db_session: AsyncSession = Depends(get_db_session)
):
    new_thread = await chat_service.create_thread(db_session, request)
    return new_thread


@app.put("/api/thread", response_model=ThreadCreateUpdateResponse)
async def update_thread(
    request: ThreadUpdateRequest, db_session: AsyncSession = Depends(get_db_session)
):
    updated_thread = await chat_service.update_thread(db_session, request)
    return updated_thread


@app.get("/api/threads", response_model=ThreadListResponse)
async def list_threads(db_session: AsyncSession = Depends(get_db_session)):
    threads = await chat_service.list_threads(db_session)
    return threads


@app.post("/api/message", response_model=MessageCreateUpdateResponse)
async def create_message(
    request: MessageCreateRequest, db_session: AsyncSession = Depends(get_db_session)
):
    new_message = await chat_service.create_message(db_session, request)
    return new_message


@app.get("/api/messages", response_model=MessageListResponse)
async def list_messages(
    request: Request, db_session: AsyncSession = Depends(get_db_session)
):
    thread_id = request.query_params.get("thread_id")
    if not thread_id:
        raise HTTPException(status_code=400, detail="thread_id is required")
    messages_list = await chat_service.list_messages(db_session, thread_id)
    return messages_list
