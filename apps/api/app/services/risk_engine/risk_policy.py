from typing import Tuple

class RiskPolicy:
    """
    Independent Risk Policy Configuration.
    Separates the ML decision threshold from the display/action risk bands.
    """
    # These are provisional display thresholds for the UI and Investigation Agent.
    # They do NOT need to strictly align with the ML operating threshold, but we
    # set HIGH to start at the locked ML operating threshold of 0.45.
    THRESHOLD_MEDIUM = 0.20
    THRESHOLD_HIGH = 0.45   # ML operating threshold
    THRESHOLD_CRITICAL = 0.80

    @classmethod
    def evaluate(cls, risk_score: float) -> Tuple[str, str]:
        """
        Evaluates the risk score and returns a tuple of (Risk Level, Decision).
        
        Decisions are conservative. Zecure is an AI-assisted detection system,
        not an autonomous financial enforcement system.
        """
        if risk_score >= cls.THRESHOLD_CRITICAL:
            return "CRITICAL", "REVIEW"
        elif risk_score >= cls.THRESHOLD_HIGH:
            return "HIGH", "REVIEW"
        elif risk_score >= cls.THRESHOLD_MEDIUM:
            return "MEDIUM", "MONITOR"
        else:
            return "LOW", "ALLOW"
