import json

from openai import AsyncOpenAI, RateLimitError, APITimeoutError, APIConnectionError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, before_sleep_log


from app.aitabbble.config import settings
from app.aitabbble.models import CalculationRequest

from app.aitabbble.config import logger

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.openai_api_key).with_options(
    max_retries=settings.openai_max_retries,
)


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type((RateLimitError, APITimeoutError, APIConnectionError)),
    before_sleep=before_sleep_log(logger, logger.level),
    reraise=True
)
async def calculate_with_openai(request: CalculationRequest) -> str:
    """
    Calculate a cell value using OpenAI based on the provided formula and spreadsheet context.
    
    This function includes automatic retry logic with exponential backoff for handling
    OpenAI rate limits, timeouts, and connection errors. It will retry up to 5 times
    with increasing delays (4-10 seconds).
    
    Args:
        request: The calculation request containing formula, target cell, columns, and data
        
    Returns:
        The calculated value as a string from OpenAI
        
    Raises:
        RateLimitError: If rate limit exceeded after all retries
        APITimeoutError: If API timeout after all retries
        APIConnectionError: If connection error after all retries
        Exception: If other OpenAI API call failures occur
    """
    # Construct the prompt for OpenAI
    system_prompt = (
        "You are an AI assistant in a spreadsheet. Your task is to calculate a single value "
        "for a target cell. You will be given the entire spreadsheet as JSON data, the user's "
        "instruction (formula), and the ID of the target cell. Use the provided data as context "
        "for your calculation. Your response must be ONLY the final calculated value, without "
        "any explanation, labels, or formatting."
    )
    
    user_prompt = (f"""
        Here is the entire spreadsheet data:
        {json.dumps(request.data, indent=2)}
        
        Here are the columns:
        {json.dumps([col.model_dump() for col in request.columns], indent=2)}
        
        The user wants to calculate a value for the cell with row ID '{request.target_cell.row_id}' and column ID '{request.target_cell.column_id}'.
        
        Please execute the following instruction to calculate the value for that specific cell:
        INSTRUCTION: "{request.formula}"
        """
    )

    logger.info(f"Processing calculation request for cell {request.target_cell.row_id}:{request.target_cell.column_id}")

    # Make asynchronous call to OpenAI
    response = await openai_client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=settings.openai_temperature,  # Low temperature for consistent calculations
        max_tokens=settings.openai_max_tokens,
    )

    # Extract the calculated value from the response
    calculated_value = response.choices[0].message.content.strip()
    logger.info(f"Calculation successful: {calculated_value}")
    
    return calculated_value


def parse_result_value(calculated_value: str):
    """
    Parse the string result from OpenAI into appropriate Python types.
    
    Args:
        calculated_value: The string value returned from OpenAI
        
    Returns:
        Parsed value as int, float, or string
    """
    # TODO: improve the parsing logic

    calculated_value = calculated_value.strip()
    try:
        num_value = calculated_value.replace('-', '').replace('+', '')
        # Try integer first
        if '.' not in num_value and num_value.isdigit():
            return int(calculated_value)
        # Try float
        elif num_value.isdigit():
            return float(calculated_value)
        else:
            return calculated_value
    except (ValueError, AttributeError):
        return calculated_value 
