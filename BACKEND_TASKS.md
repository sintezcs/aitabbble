# Backend Implementation Tasks

This document outlines the steps to build the FastAPI backend service. The service will have a single endpoint to handle AI-based cell calculations, using the entire spreadsheet as context.

## 1. Project Setup with `uv`

-   **Task:** Initialize a new FastAPI project.
-   **Directory:** Create a `backend` directory in the project root.
-   **Environment:** Use `uv` to create and manage the virtual environment.
-   **Dependencies:** Create a `requirements.txt` file and add the following dependencies:
    ```
    fastapi
    uvicorn
    pydantic
    openai
    python-dotenv
    ```
-   **Installation:** Run `uv pip install -r requirements.txt` to install the packages.

## 2. Create FastAPI Application and Config

-   **Task:** Create the main application file and configure FastAPI, including settings management for the API key.
-   **File:** `backend/main.py`
-   **Details:**
    -   Instantiate the `FastAPI` app.
    -   Use Pydantic's `BaseSettings` to create a `Settings` class that automatically loads `OPENAI_API_KEY` from a `.env` file.
    -   Instantiate the `openai` client using the key from the settings object.
    -   Configure CORS (Cross-Origin Resource Sharing) using `CORSMiddleware` to allow requests from the Next.js frontend (e.g., `http://localhost:3000`).

## 3. Define Pydantic Models

-   **Task:** Create Pydantic models for API request and response validation. The request model must be able to receive the entire state of the spreadsheet.
-   **File:** `backend/main.py`
-   **Details:**
    -   Create a `TargetCell` model with `row_id: str` and `column_id: str`.
    -   Create a `Column` model with `id: str` and `header: str`.
    -   Create a `CalculationRequest` model. It should accept:
        -   `formula`: A `str` containing the user's AI-formula.
        -   `target_cell`: The `TargetCell` model.
        -   `columns`: A `list[Column]` representing the table headers.
        -   `data`: A `list[dict[str, any]]` representing all rows in the table.
    -   Create a `CalculationResponse` model. It should return:
        -   `result`: A `str` or `any` containing the calculated value from the LLM.

## 4. Create the Calculation Endpoint

-   **Task:** Implement the API endpoint that will receive the full spreadsheet state, call the OpenAI API, and return the result for the target cell.
-   **File:** `backend/main.py`
-   **Details:**
    -   Create a POST endpoint at `/api/calculate`.
    -   The endpoint function should be `async` and accept the `CalculationRequest` model as its body.

## 5. Implement OpenAI Logic

-   **Task:** Construct a detailed prompt and call the OpenAI API.
-   **File:** `backend/main.py`
-   **Details:**
    -   Inside the `/api/calculate` endpoint, construct a prompt for the OpenAI `ChatCompletion` API. The prompt must clearly state the context (the full table) and the specific task (calculate a value for a target cell based on a formula).
    -   **Prompt Structure:**
        -   **System Prompt:** "You are an AI assistant in a spreadsheet. Your task is to calculate a single value for a target cell. You will be given the entire spreadsheet as JSON data, the user's instruction (formula), and the ID of the target cell. Use the provided data as context for your calculation. Your response must be ONLY the final calculated value, without any explanation, labels, or formatting."
        -   **User Prompt:** Use an f-string to inject the table data, formula, and target cell information.
            ```python
            f"""
            Here is the entire spreadsheet data:
            {json.dumps(request.data)}

            Here are the columns:
            {json.dumps([col.dict() for col in request.columns])}

            The user wants to calculate a value for the cell with row ID '{request.target_cell.row_id}' and column ID '{request.target_cell.column_id}'.

            Please execute the following instruction to calculate the value for that specific cell:
            INSTRUCTION: "{request.formula}"
            """
            ```
    -   Use the `openai.ChatCompletion.acreate` method for an asynchronous API call.
    -   Parse the response from the LLM to extract the calculated value.
    -   Return the value in the `CalculationResponse` model.
    -   Implement error handling for the API call and for cases where the LLM response is not in the expected format.