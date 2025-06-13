import json
import random
import asyncio

from openai import AsyncOpenAI

from app.aitabbble.config import settings


class AiTool:
    """Base class for AI tools."""

    result: str = None
    tool_call_id: str = None
    tool_name: str = None
    args: dict = {}

    def report_status(self, status: str, intermediate_result=None, result=None) -> str:
        """Report the status of the tool execution."""
        status_dict = {
            "type": "tool-call",
            "toolCallId": self.tool_call_id,
            "toolName": self.tool_name,
            "args": self.args,
            "status": {
                "type": status,
            },
        }
        if result:
            status_dict["result"] = str(result)
        if intermediate_result:
            status_dict["args"].update(
                {
                    "result": intermediate_result,
                }
            )
        if status == "complete":
            status_dict["status"]["reason"] = "stop"
        # convert args to string
        status_dict["args"] = json.dumps(status_dict["args"])
        return json.dumps(status_dict) + "\n\n"

    async def run(self, args: str) -> str:
        pass


class RandomTool(AiTool):
    """Random number generator tool."""

    tool_name = "generate_random_integer"

    random_statuses = ["rotating cogs", "plumbing", "wiring", "connecting", "thinking"]

    def get_random_status(self) -> str:
        return random.choice(self.random_statuses)

    async def run(self, tool_call_id: str, args: str):
        print(f"Running tool {self.tool_name} with args {args}")
        self.args = {}
        self.tool_call_id = tool_call_id
        yield self.report_status("running")

        for i in range(5):
            yield self.report_status(
                "running", intermediate_result=self.get_random_status()
            )
            await asyncio.sleep(0.5)

        self.result = random.randint(1, 100)
        yield self.report_status("complete", result=self.result)
        print(f"Tool {self.tool_name} completed with result {self.result}")


class WebSearchTool(AiTool):
    """Web search tool."""

    tool_name = "web_search"

    async def run(self, tool_call_id: str, args: str):
        print(f"Running tool {self.tool_name} with args {args}")
        args_dict = json.loads(args)
        self.args = args_dict
        self.tool_call_id = tool_call_id
        yield self.report_status("running")

        search_query = args_dict.get("search_query")
        if not search_query:
            yield self.report_status("error", result="No search query provided")
            return

        full_result = ""
        async for intermediate_result in self.search_query(search_query):
            if intermediate_result:
                full_result += intermediate_result
                yield self.report_status("running", intermediate_result=full_result)

        self.result = full_result
        yield self.report_status("complete", result=self.result)
        print(f"Tool {self.tool_name} completed with result {self.result}")
        return

    async def search_query(self, query: str):
        """Search the web.

        Use OpenAI to search the web for the query.
        Yield intermediate results as they are found.
        Return the final result.
        """
        # Initialize OpenAI client
        openai_client = AsyncOpenAI(api_key=settings.openai_api_key)
        messages = [{"role": "user", "content": query}]
        response = await openai_client.chat.completions.create(
            model=settings.openai_search_model,
            web_search_options={
                "search_context_size": "low",
            },
            messages=messages,
            stream=True,
        )

        async for chunk in response:
            yield chunk.choices[0].delta.content
        return
