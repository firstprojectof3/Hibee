from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Any, Dict

from app.services.llm import call_llm
from app.services.prompt_loader import load_prompt_from_ai_test

router = APIRouter()

class Suggestion(BaseModel):
    title: str = Field(..., max_length=16)
    description: str
    difficulty: Literal["easy", "medium", "hard"]
    why_this: str

class ReportGenerationOutput(BaseModel):
    title: str = Field(..., max_length=24)
    summary: str = Field(..., max_length=220)
    comments: List[str] = Field(..., min_length=1, max_length=3)
    suggestions: List[Suggestion] = Field(..., min_length=1, max_length=1)

class ReportGenerationInput(BaseModel):
    user_profile: Optional[Dict[str, Any]] = None
    today_metrics: Optional[Dict[str, Any]] = None
    profile_metrics: Optional[Dict[str, Any]] = None
    checkin_answers: Optional[Dict[str, Any]] = None
    constraints: Optional[Dict[str, Any]] = None

@router.post("/ai/daily-report", response_model=ReportGenerationOutput)
def daily_report(input: ReportGenerationInput):
    # ✅ ai-test에 있는 프롬프트 파일을 그대로 읽어서 사용
    system_prompt = load_prompt_from_ai_test("prompts/report_v1.txt")

    result = call_llm(
        system_prompt=system_prompt,
        user_content=input.dict()
    )
    
        # 1) suggestions dict -> list 보정 (이미 넣었으면 유지)
    if isinstance(result, dict) and "suggestions" in result:
        if isinstance(result["suggestions"], dict):
            result["suggestions"] = [result["suggestions"]]

    # 2) ✅ 최소 길이 보장: comments/suggestions가 비면 기본값 채우기
    if not isinstance(result, dict):
        result = {}

    if not result.get("comments"):
        result["comments"] = ["오늘의 흐름을 한 번 정리해보는 단계예요."]

    if not result.get("suggestions"):
        result["suggestions"] = [{
            "title": "짧게 숨 고르기",
            "description": "오늘 중 편한 순간에 30초만 눈을 감고 숨을 3번 천천히 쉬어봐요.",
            "difficulty": "easy",
            "why_this": "리포트 출력 형식을 안정적으로 만들기 위한 최소 제안이에요."
        }]

    
    return result
