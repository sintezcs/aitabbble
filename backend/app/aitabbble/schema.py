import json
from typing import Any, List, Optional, Union

from pydantic import BaseModel, Field, field_validator


class TargetCell(BaseModel):
    row_id: str
    column_id: str = Field(alias="col_id")


class Column(BaseModel):
    id: str
    header: str = Field(alias="label")
    width: Optional[int] = None


class CalculationRequest(BaseModel):
    formula: str
    target_cell: TargetCell
    columns: List[Column]
    data: List[dict[str, Any]]


class CalculationResponse(BaseModel):
    result: Any


class ChatTextContent(BaseModel):
    type: str
    text: str


class ChatToolContent(BaseModel):
    type: str
    tool_name: str = Field(alias="toolName")
    tool_call_id: str = Field(alias="toolCallId")
    args: str = Field(alias="args")
    result: Any = None

    @field_validator("args", mode="before")
    @classmethod
    def ensure_args_is_string(cls, v):
        if isinstance(v, dict):
            return json.dumps(v)
        return str(v)


ChatMessageContent = Union[ChatTextContent, ChatToolContent]


class ChatMessage(BaseModel):
    id: str
    created_at: str = Field(alias="createdAt")
    content: List[ChatMessageContent]
    role: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ThreadResponse(BaseModel):
    id: str
    ui_thread_id: str
    user_id: str | None = None
    title: str
    archived: bool
    created_at: str
    updated_at: str


class ThreadListResponse(BaseModel):
    threads: List[ThreadResponse]


class ThreadCreateRequest(BaseModel):
    ui_thread_id: str
    user_id: str | None = None
    title: str | None = None


class ThreadUpdateRequest(BaseModel):
    ui_thread_id: str
    title: str | None = None
    archived: bool | None = None


class ThreadCreateUpdateResponse(BaseModel):
    id: str
    ui_thread_id: str


class MessageResponse(BaseModel):
    id: str
    thread_id: str
    role: str
    content: list[dict]
    created_at: str
    updated_at: str | None = None


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]


class MessageCreateRequest(BaseModel):
    ui_message_id: str
    thread_id: str
    role: str
    content: list[dict]


class MessageCreateUpdateResponse(BaseModel):
    id: str
    ui_message_id: str
