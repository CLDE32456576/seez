from pydantic import BaseModel, field_validator, UUID4
from typing import Optional, List, Literal
from datetime import datetime


class StartCallRequest(BaseModel):
    scenario_id: str
    mode: Literal["easy", "medium", "hard"]
    language: Literal["english", "spanish"]
    product_id: Optional[str] = None

    @field_validator("scenario_id")
    @classmethod
    def validate_scenario_id(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("Invalid scenario_id")
        return v


class StartCallResponse(BaseModel):
    call_id: str
    retell_call_id: str
    access_token: str


class HintRequest(BaseModel):
    context: str = ""

    @field_validator("context")
    @classmethod
    def limit_context(cls, v: str) -> str:
        return v[:1500]  # Cap at ~1500 chars — enough for 3 exchanges, prevents abuse


class EvalScores(BaseModel):
    opening: int
    rapport: int
    discovery: int
    objection: int
    closing: int
    adaptability: int


class PsychologicalInsights(BaseModel):
    confidence_level: str
    reciprocity_usage: str
    social_proof_deployment: str
    loss_aversion_framing: str
    empathy_calibration: str
    authority_signals: str


class EvalResult(BaseModel):
    scores: EvalScores
    grade: str
    overall: int
    strengths: List[str]
    improvements: List[str]
    psychological_insights: PsychologicalInsights
    coach_note: str
    elo_change: int


class CheckoutRequest(BaseModel):
    tier: Literal["pro", "teams"]


class ProductUpload(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 200:
            raise ValueError("Name must be 1–200 characters")
        return v
