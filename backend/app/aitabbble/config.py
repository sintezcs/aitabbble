import logging
from logging import getLogger

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = Field("local")
    openai_api_key: str = Field()
    openai_model: str = Field("gpt-4.1-mini")
    openai_max_retries: int = Field(5, gt=0)
    openai_temperature: float = Field(0.1, gt=0)
    openai_max_tokens: int = Field(1000, gt=0)
    log_level: str = Field("INFO")
    sentry_dsn: str|None = Field(None)
    
    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings()

logging.basicConfig(level=settings.log_level)
logger = getLogger(__name__)

