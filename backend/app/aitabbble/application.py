import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk

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

from app.aitabbble.config import logger  # noqa: E402
from app.aitabbble.models import CalculationRequest, CalculationResponse  # noqa: E402
from app.aitabbble.openai_client import calculate_with_openai, parse_result_value  # noqa: E402



# Initialize FastAPI app
app = FastAPI(
    title="AI Spreadsheet Backend",
    description="Backend service for AI-assisted spreadsheet calculations",
    version="1.0.0"
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
    """
    Calculate a cell value using OpenAI based on the provided formula and spreadsheet context.
    """
    try:
        # Call OpenAI to calculate the value
        calculated_value = await calculate_with_openai(request)

        # Parse the result into appropriate type
        result = parse_result_value(calculated_value)

        return CalculationResponse(result=result)

    except Exception as e:
        logger.error(f"Error during calculation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate cell value: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {"status": "healthy", "service": "ai-spreadsheet-backend"}
