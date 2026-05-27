from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    # Note: legacy `text-embedding-004` is deprecated/removed (404 on embedContent).
    embedding_model: str = "gemini-embedding-001"
    cors_origins: str = "http://localhost:3000"
    max_upload_bytes: int = 5 * 1024 * 1024


settings = Settings()
