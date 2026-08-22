import json
from app.schemas.investigation import StructuredEvidence, InvestigationResult
from app.agents.investigation.provider import LLMProvider
from app.agents.investigation.prompts import INVESTIGATION_SYSTEM_PROMPT

class InvestigationAgent:
    """
    The InvestigationAgent has no direct database, filesystem, shell, financial-action, or arbitrary tool access.
    It receives only validated structured evidence produced by the deterministic backend and uses an LLM provider to reason over it.
    """
    def __init__(self, provider: LLMProvider):
        self.provider = provider
        
    async def investigate(self, evidence: StructuredEvidence) -> InvestigationResult:
        # Convert evidence to JSON string for the prompt
        evidence_json = evidence.model_dump_json(indent=2)
        
        # Invoke LLM
        result = await self.provider.investigate(
            prompt=INVESTIGATION_SYSTEM_PROMPT,
            evidence=evidence_json
        )
        return result
