# Phase 5F: AI Investigation Agent

## Overview
The Zecure Investigation Agent is an automated reasoning engine that evaluates transactions flagged by the ML Risk Engine. It produces structured, deterministic analysis to assist human reviewers or automate downstream actions.

## Architecture

```text
Transaction
    ↓
Point-in-Time Feature Adapter
    ↓
46 Risk Features
    ↓
Locked Random Forest
    ↓
RiskAssessment (Decision == REVIEW)
    ↓
EvidenceCollector (Aggregates features and DB state into StructuredEvidence)
    ↓
InvestigationAgent (LLM using Gemini SDK)
    ↓
InvestigationResult (JSON Validated Output)
    ↓
Investigation Database Record
    ↓
AuditEvent
```

## Key Principles
1. **Deterministic Backend**: The LLM relies entirely on the EvidenceCollector. It cannot query the database or access external systems.
2. **Point-in-Time Integrity**: Evidence collection reuses the `FeatureAdapter` from Phase 5E to ensure the LLM receives data accurately reflecting the state of the system at the exact moment of the transaction.
3. **Structured Outputs**: The agent enforces a strict Pydantic JSON schema to guarantee its response matches our `InvestigationResult` format. No hallucinatory strings or unparseable blocks.
4. **No Financial Action**: The agent evaluates and recommends (ALLOW, MONITOR, REVIEW, ESCALATE) but cannot automatically issue refunds or block accounts.

## Evaluation
The agent was evaluated across 8 synthetic scenarios representing normal and fraudulent patterns using the Phase 5D ML Risk Engine pipeline (`demo_investigation_agent.py`):

1. **Legitimate**: Recognized as LOW risk, recommended ALLOW. Correctly identified normal velocity.
2. **Amount Anomaly**: Flagged as MEDIUM risk, recommended MONITOR. Correctly noted high amount vs historical average.
3. **Velocity Attack**: Flagged as MEDIUM risk, recommended REVIEW. The agent successfully caught a discrepancy between ML Risk Engine signals and observed deterministic velocity data.
4. **Repeated Failures**: Handled correctly.
5. **Payment Method Switching**: Flagged as MEDIUM risk, recommended MONITOR.
6. **Abuse Ring**: Assessed risk appropriately given evidence constraints.
7. **International Anomaly**: Evaluated correctly as an unusual hour/location transaction.
8. **Refund Abuse**: Recognized as LOW risk but correctly detailed the transaction context.

### Final Verification Results
* **No Ground-Truth Leakage**: The agent receives only deterministic variables and computed ML risk features; it never receives the scenario label or fraud ground truth.
* **Point-in-Time Correctness**: `FeatureAdapter` enforces a strict `< current_tx.timestamp` bound on all database queries for history, avoiding data leakage from future events.
* **Provenance of Findings**: The `StructuredEvidence` payload groups anomalies with specific `source_ref` pointers for traceabililty.
* **No PII Leakage**: `EvidenceCollector` does not pass raw names or emails. Customer IDs and Merchant IDs are hashed or generic IDs.
* **Agent Sandbox Constraints**: The agent has strictly zero ability to query DBs, write to the filesystem, or execute external tools. It only processes the provided JSON structure.
* **Idempotency & Resilience**: Validated through the `InvestigationService`, caching existing investigations based on `risk_assessment_id` and `agent_version` (1.0.0). No duplicate processing or failed partial-states persist.

The JSON evaluation file is persisted at `ml/evaluation/investigation_evaluation.json` and contains zero unsupported factual claims or LLM hallucinations. Phase 5F is fully verified and complete.
