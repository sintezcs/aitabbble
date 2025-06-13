import datetime
import uuid

from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    JSON,
    Boolean,
    Integer,
    ForeignKey,
)


Base = declarative_base()


class Thread(Base):
    __tablename__ = "threads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ui_thread_id = Column(
        String,
        nullable=False,
        unique=True,
        comment="The thread id from the AssistantUI frontend",
    )
    user_id = Column(String, nullable=True, default=None)
    title = Column(String(255))
    archived = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc)
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.datetime.now(datetime.timezone.utc),
        onupdate=datetime.datetime.now(datetime.timezone.utc),
    )
    messages = relationship("Message", back_populates="thread")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ui_message_id = Column(
        String, nullable=False, comment="The message id from the AssistantUI frontend"
    )
    ui_thread_id = Column(String, ForeignKey("threads.ui_thread_id"), nullable=False)
    thread = relationship(
        "Thread", back_populates="messages", uselist=False, foreign_keys=[ui_thread_id]
    )
    role = Column(String(20), nullable=False)
    raw_content = Column(JSON)
    created_at = Column(
        DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc)
    )
