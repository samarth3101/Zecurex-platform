import os
import json
from abc import ABC, abstractmethod
from google import genai
from google.genai import types
from app.schemas.investigation import InvestigationResult

class LLMProvider(ABC):
    """Abstract interface for LLM providers."""
    
    @abstractmethod
    async def investigate(self, prompt: str, evidence: str) -> InvestigationResult:
        """
        Executes the investigation using the LLM.
        
        :param prompt: The system prompt.
        :param evidence: The structured evidence as a JSON string.
        :return: An InvestigationResult object.
        """
        pass


class GeminiProvider(LLMProvider):
    """Gemini implementation using the official google-genai SDK."""
    
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name
        # The SDK will automatically pick up GEMINI_API_KEY from the environment
        self.client = genai.Client()
        
    async def investigate(self, prompt: str, evidence: str) -> InvestigationResult:
        # Use Structured Outputs to guarantee we get back an InvestigationResult
        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=evidence,
            config=types.GenerateContentConfig(
                system_instruction=prompt,
                response_mime_type="application/json",
                response_schema=InvestigationResult,
                temperature=0.1,  # Keep it deterministic
            )
        )
        
        # Pydantic validation
        result = InvestigationResult.model_validate_json(response.text)
        return result
