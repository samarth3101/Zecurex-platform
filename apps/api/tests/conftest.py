import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport
from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app

@pytest_asyncio.fixture(scope="function")
async def db_engine():
    assert settings.TEST_DATABASE_URL is not None, "TEST_DATABASE_URL is not set"
    engine = create_async_engine(settings.TEST_DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    async_session = async_sessionmaker(db_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest_asyncio.fixture(scope="function")
async def async_client(db_session):
    async def _get_test_db():
        yield db_session

    app.dependency_overrides[get_db] = _get_test_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
