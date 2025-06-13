import json
import random
from typing import List

from openai import AsyncOpenAI, RateLimitError, APITimeoutError, APIConnectionError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)


from app.aitabbble.config import settings
from app.aitabbble.schema import CalculationRequest, ChatRequest, ChatMessage
from app.aitabbble.tools import AiTool, RandomTool, WebSearchTool

from app.aitabbble.config import logger

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.openai_api_key).with_options(
    max_retries=settings.openai_max_retries,
)


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(
        (RateLimitError, APITimeoutError, APIConnectionError)
    ),
    before_sleep=before_sleep_log(logger, logger.level),
    reraise=True,
)
async def calculate_with_openai(request: CalculationRequest) -> str:
    """Calculate a cell value using OpenAI based on the provided formula and spreadsheet context.

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

    user_prompt = f"""
        Here is the entire spreadsheet data:
        {json.dumps(request.data, indent=2)}
        
        Here are the columns:
        {json.dumps([col.model_dump() for col in request.columns], indent=2)}
        
        The user wants to calculate a value for the cell with row ID '{request.target_cell.row_id}' and column ID '{request.target_cell.column_id}'.
        
        Please execute the following instruction to calculate the value for that specific cell:
        INSTRUCTION: "{request.formula}"
        """

    logger.info(
        f"Processing calculation request for cell {request.target_cell.row_id}:{request.target_cell.column_id}"
    )

    # Make asynchronous call to OpenAI
    response = await openai_client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=settings.openai_temperature,  # Low temperature for consistent calculations
        max_tokens=settings.openai_max_tokens,
    )

    # Extract the calculated value from the response
    calculated_value = response.choices[0].message.content.strip()
    logger.info(f"Calculation successful: {calculated_value}")

    return calculated_value


async def random_number():
    """Tool to generate a random number between 1 and 100."""
    return random.randint(1, 100)


def tool_factory(function_name, arguments=None) -> AiTool:
    match function_name.lower():
        case "generate_random_integer":
            return RandomTool()
        case "web_search":
            return WebSearchTool()
        case _:
            return None


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "generate_random_integer",
            "description": "Returns a random number between 1 and 100",
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search the web for real-time information about any topic. Use this tool when you need up-to-date information that might not be in your training data, or when you need to verify current facts. The results will be returned as a formatted text that you can directly reference in your response.",
            "parameters": {
                "type": "object",
                "properties": {
                    "search_query": {
                        "type": "string",
                        "description": "The specific search query to look up on the web. Be precise and include relevant keywords to get the most accurate results. For technical queries, include version numbers or dates if applicable.",
                    },
                },
                "required": ["search_query"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    },
]


def assistant_messages_to_openai(messages: List[ChatMessage]):
    """
    Convert the chat messages to OpenAI messages.
    """
    openai_messages = []

    for message in messages:
        for message_content in message.content:
            if message_content.type == "text":
                openai_messages.append(
                    {
                        "role": message.role,
                        "content": message_content.text,
                    }
                )
            if message_content.type == "tool-call" and message_content.result:
                openai_messages.append(
                    {
                        "role": "tool",
                        "content": message_content.result,
                        "tool_call_id": message_content.tool_call_id,
                    }
                )
            # skip intermediate stream results (hackish)
            if message_content.type == "tool-call" and not message_content.result:
                openai_messages.append(
                    {
                        "role": "assistant",
                        "tool_calls": [
                            {
                                "id": message_content.tool_call_id,
                                "type": "function",
                                "function": {
                                    "name": message_content.tool_name,
                                    "arguments": message_content.args,
                                },
                            }
                        ],
                    }
                )

    return openai_messages


async def _stream_openai_chat(chat_messages: List[dict]):
    """Stream the chat with the OpenAI API."""
    response = await openai_client.chat.completions.create(
        model=settings.openai_model,
        messages=chat_messages,
        tools=TOOLS,
        stream=True,
    )

    full_content = ""
    tool_calls = []

    async for chunk in response:
        print(chunk)
        # Handle tool calls
        if chunk.choices[0].delta.tool_calls:
            for tool_call in chunk.choices[0].delta.tool_calls:
                # Initialize tool call if new
                while len(tool_calls) <= tool_call.index:
                    tool_calls.append(
                        {
                            "id": None,
                            "type": "function",
                            "function": {"name": "", "arguments": ""},
                        }
                    )

                if tool_call.id:
                    tool_calls[tool_call.index]["id"] = tool_call.id

                if tool_call.function:
                    if tool_call.function.name:
                        tool_calls[tool_call.index]["function"]["name"] = (
                            tool_call.function.name
                        )
                    if tool_call.function.arguments:
                        tool_calls[tool_call.index]["function"]["arguments"] += (
                            tool_call.function.arguments
                        )

        # Handle content
        content = chunk.choices[0].delta.content
        if content is not None:
            print("No tool calls, adding content")
            full_content += content
            yield json.dumps({"type": "text", "text": content}) + "\n\n"

        if len(tool_calls) > 0 and chunk.choices[0].finish_reason == "tool_calls":
            print(f"Tool calls, executing tools: {tool_calls}")
            # only take a single tool call for now
            tool_call = tool_calls[0]
            tool = tool_factory(tool_call["function"]["name"])
            if tool:
                async for tool_progress in tool.run(
                    tool_call["id"], tool_call["function"]["arguments"]
                ):
                    # report the tool execution progress to the client
                    yield tool_progress
                # update the chat messages with the tool call
                chat_messages.append(
                    {
                        "tool_calls": [
                            {
                                "id": tool_call["id"],
                                "type": "function",
                                "function": {
                                    "name": tool_call["function"]["name"],
                                    "arguments": tool_call["function"]["arguments"],
                                },
                            }
                        ],
                        "role": "assistant",
                    }
                )
                # update the chat messages with the tool call result
                chat_messages.append(
                    {
                        "tool_call_id": tool_call["id"],
                        "role": "tool",
                        "content": str(tool.result),
                    }
                )
                # call the stream_chat recursively to handle the next tool call
                async for ai_tool_result in _stream_openai_chat(chat_messages):
                    yield ai_tool_result

                return


async def stream_chat(chat_request: ChatRequest):
    """Stream the chat with the OpenAI API."""
    chat_messages = assistant_messages_to_openai(chat_request.messages)

    async for result in _stream_openai_chat(chat_messages):
        yield result


def parse_result_value(calculated_value: str):
    """Parse the string result from OpenAI into appropriate Python types.

    Args:
        calculated_value: The string value returned from OpenAI

    Returns:
        Parsed value as int, float, or string
    """
    # TODO: improve the parsing logic

    calculated_value = calculated_value.strip()
    try:
        num_value = calculated_value.replace("-", "").replace("+", "")
        # Try integer first
        if "." not in num_value and num_value.isdigit():
            return int(calculated_value)
        # Try float
        elif num_value.isdigit():
            return float(calculated_value)
        else:
            return calculated_value
    except (ValueError, AttributeError):
        return calculated_value
