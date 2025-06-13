from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.aitabbble.schema import (
    MessageCreateRequest,
    MessageCreateUpdateResponse,
    MessageListResponse,
    MessageResponse,
    ThreadUpdateRequest,
    ThreadListResponse,
    ThreadCreateRequest,
    ThreadCreateUpdateResponse,
    ThreadResponse,
)
from app.aitabbble.models import Thread, Message


async def create_thread(
    db_session: AsyncSession, thread: ThreadCreateRequest
) -> ThreadCreateUpdateResponse:
    """Create a new thread."""
    new_thread = Thread(
        ui_thread_id=thread.ui_thread_id,
        user_id=thread.user_id,
        title=thread.title,
    )
    db_session.add(new_thread)
    await db_session.commit()
    await db_session.refresh(new_thread)
    return ThreadCreateUpdateResponse(
        id=new_thread.id,
        ui_thread_id=new_thread.ui_thread_id,
    )


async def update_thread(
    db_session: AsyncSession, thread: ThreadUpdateRequest
) -> ThreadCreateUpdateResponse:
    """Update an existing thread."""
    db_thread = await db_session.execute(
        select(Thread).where(Thread.ui_thread_id == thread.ui_thread_id)
    )
    db_thread = db_thread.scalar_one_or_none()
    if db_thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.title != db_thread.title and thread.title is not None:
        db_thread.title = thread.title
    if thread.archived is not None:
        db_thread.archived = thread.archived
    db_session.add(db_thread)
    await db_session.commit()
    await db_session.refresh(db_thread)
    return ThreadCreateUpdateResponse(
        id=db_thread.id,
        ui_thread_id=db_thread.ui_thread_id,
    )


async def get_thread(db_session: AsyncSession, ui_thread_id: str) -> ThreadResponse:
    """Get a thread by its UI thread ID."""
    db_thread = await db_session.execute(
        select(Thread).where(Thread.ui_thread_id == ui_thread_id)
    )
    db_thread = db_thread.scalar_one_or_none()
    if db_thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return ThreadResponse(
        id=db_thread.id,
        ui_thread_id=db_thread.ui_thread_id,
        user_id=db_thread.user_id,
        title=db_thread.title,
        archived=db_thread.archived,
        created_at=db_thread.created_at.isoformat(),
        updated_at=db_thread.updated_at.isoformat(),
    )


async def list_threads(db_session: AsyncSession) -> ThreadListResponse:
    """List all threads."""
    db_threads = await db_session.execute(select(Thread))
    db_threads = db_threads.scalars().all()
    return ThreadListResponse(
        threads=[
            ThreadResponse(
                id=thread.ui_thread_id,
                ui_thread_id=thread.ui_thread_id,
                user_id=thread.user_id,
                title=thread.title,
                archived=thread.archived,
                created_at=thread.created_at.isoformat(),
                updated_at=thread.updated_at.isoformat(),
            )
            for thread in db_threads
        ]
    )


async def delete_thread(db_session: AsyncSession, ui_thread_id: str):
    pass


async def create_message(
    db_session: AsyncSession, message: MessageCreateRequest
) -> MessageCreateUpdateResponse:
    """Create a new message."""
    new_message = Message(
        ui_message_id=message.ui_message_id,
        ui_thread_id=message.thread_id,
        role=message.role,
        raw_content=message.content,
    )
    db_session.add(new_message)
    await db_session.commit()
    await db_session.refresh(new_message)
    return MessageCreateUpdateResponse(
        id=new_message.id,
        ui_message_id=new_message.ui_message_id,
    )


async def list_messages(
    db_session: AsyncSession, thread_id: str
) -> MessageListResponse:
    """List all messages for a thread."""
    db_messages = await db_session.execute(
        select(Message).where(Message.ui_thread_id == thread_id)
    )
    db_messages = db_messages.scalars().all()
    return MessageListResponse(
        messages=[
            MessageResponse(
                id=message.ui_message_id,
                thread_id=message.ui_thread_id,
                role=message.role,
                content=message.raw_content,
                created_at=message.created_at.isoformat(),
            )
            for message in db_messages
        ]
    )
