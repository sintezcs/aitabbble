# AI Spreadsheet Backend

FastAPI backend service for AI-assisted spreadsheet calculations.

## Setup

1. **Create a virtual environment using uv:**
   ```bash
   cd backend
   uv venv
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   uv sync --locked --no-dev
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory with your OpenAI API key:
   ```
   cd backend
   cp .env.example .env
   ```

## Linting
To run the ruff linter:

```bash
cd backend
uv run ruff check app/
```

## Running the Server

```bash
cd backend/
python main.py
```

The server will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- API Documentation: `http://localhost:8000/docs`
- ReDoc Documentation: `http://localhost:8000/redoc`

## API Endpoints

### POST `/api/calculate`

Calculate a cell value using AI based on the provided formula and spreadsheet context.

**Request Body:**
```json
{
  "formula": "Calculate the average of all values in the Price column",
  "target_cell": {
    "row_id": "row_1",
    "col_id": "avg_price"
  },
  "columns": [
    {"id": "product", "header": "Product"},
    {"id": "price", "header": "Price"}
  ],
  "data": [
    {"product": "Apple", "price": 1.50},
    {"product": "Banana", "price": 0.75}
  ]
}
```

**Response:**
```json
{
  "result": 1.125
}
```

### GET `/health`

Health check endpoint for monitoring.

## Features

- Asynchronous OpenAI API integration
- Automatic retry logic for OpenAI API calls
- CORS support for frontend integration
- Comprehensive error handling
- Type validation with Pydantic
- Automatic number parsing for calculated results
- Production-ready logging 
- Sentry error tracking
