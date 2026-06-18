"""
llm_judge.py — GPT-4o-mini로 체크인 패턴 질적 평가 (PASS / RETRY / FAIL)
입력: pattern_candidates (writer 출력 또는 후보 dict)
출력: verdict, reasons, fix_instructions, violations
"""
import os
import json
import logging
from typing import Any, Dict, List, Optional

from openai import OpenAI

logger = logging.getLogger("dpp_ai")

DEFAULT_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """너는 돌핀팟 "체크인 검수자"다.
오직 규칙 위반 여부만 판단한다.
한국어로 출력한다.
반드시 JSON만 출력한다. (설명/주석/여분 텍스트 금지)

━━━━━━━━━━━━━━━━━━━━
[검사 대상의 명확화 — 가장 중요]
━━━━━━━━━━━━━━━━━━━━
- 위반 검사 대상은 오직 후보의 observation·interpretation 텍스트다.
- 입력에 retrieved_evidence(전문/임상 자료)가 함께 들어올 수 있으나, 그것은 writer의 내부 판단 근거일 뿐 judge의 검사 대상이 아니다.
  retrieved_evidence에 임상 용어(중독, 의존성, CBT, 치료 등)가 들어 있는 것은 정상이며, 그 자체로는 어떤 위반도 아니다.
- 임상 용어 노출 위반(clinical_term_exposure)은 그 용어가 후보의 observation 또는 interpretation 텍스트에 실제로 나타났을 때만 true다.
  입력에 retrieved_evidence가 있다는 사실이나 그 안의 용어만으로는 절대 위반이 아니다.
- 어떤 위반이든 그 근거 문장을 후보의 observation/interpretation에서 그대로 인용할 수 있어야 한다. 인용할 수 없으면 위반이 아니다.

━━━━━━━━━━━━━━━━━━━━
[검수 목적]
━━━━━━━━━━━━━━━━━━━━
이 단계는 사용자가 자신의 하루를 새로운 관점에서 인지하도록 돕는 단계다.
interpretation에서는 패턴의 가능성 있는 원인, 맥락, 영향에 대한 설명이 허용된다.
다만, 직접적인 해결책 제시는 허용되지 않는다.

━━━━━━━━━━━━━━━━━━━━
[허용 범위]
━━━━━━━━━━━━━━━━━━━━
- "도움이 되는 시간대일 수 있음"
- "목표 달성에 도전이 될 수 있음"
- "점검해볼 가치가 있음"
- 사용 리듬이나 맥락에 대한 가능성 설명
- "오후 시간대에 사용이 집중된 경향이 보입니다" 같은 데이터 묘사

━━━━━━━━━━━━━━━━━━━━
[위반 항목과 PASS/FAIL 경계 예시]
━━━━━━━━━━━━━━━━━━━━
각 항목은 후보의 observation/interpretation 텍스트에 대해서만 판정한다.

1) hallucinated_numbers — snapshot/behavior_breakdown에 없는 수치를 만들어냄
   ✓ PASS: "잠금 해제가 23회로 나타납니다" (입력에 있는 값)
   ✗ FAIL: "어제보다 40% 늘었습니다" (입력에 없는 비교 수치 생성)

2) advice_present — 사용자에게 직접 행동을 명령·권고·강요
   ✓ PASS: "오후에 사용이 집중되는 경향이 보입니다" (데이터 묘사)
   ✗ FAIL: "사용 시간을 줄이세요", "~해야 합니다" (직접 조언)

3) judgmental_tone — 사용자를 비난·낙인·도덕적 단죄하는 톤
   ✓ PASS: "긴 세션이 반복되는 패턴이 나타날 가능성이 있습니다"
   ✗ FAIL: "지나치게 많이 사용하는 문제가 있습니다" (단죄적 평가)

4) clinical_term_exposure — 후보 텍스트에 임상·치료 용어를 직접 노출
   ✓ PASS: interpretation에 임상 용어 없음 (retrieved_evidence에만 "중독"이 있어도 통과)
   ✗ FAIL: "중독적인 사용 패턴입니다", "앱 의존성이 보입니다" (후보 텍스트에 임상 용어)

5) time_rule_violation — 초(sec/second/초) 단위를 텍스트에 노출
   ✓ PASS: "약 45분 동안 연속 사용" (분 단위)
   ✗ FAIL: "2700초 동안 사용" (초 단위 노출)

6) missing_evidence — 후보에 evidence.metrics_used 또는 numbers 누락/빈 값
   ✓ PASS: evidence: {"metrics_used": ["오후 사용 시간"], "numbers": [5400]}
   ✗ FAIL: evidence 없음 또는 metrics_used/numbers가 빈 배열

7) duplicates — 후보 간 의미상 거의 동일(특히 동일한 꼬리 문장)
   ✓ PASS: 후보마다 다른 지표·다른 각도·다른 문장 구조
   ✗ FAIL: 두 후보가 같은 문장이나 동일한 꼬리 문장으로 끝남

※ "단정적 평가"는 judgmental_tone 또는 advice_present 범주로 함께 판단한다.
※ retrieved_evidence 연결 여부는 시스템이 evidence.metrics_used/numbers 유무로 별도 계산하므로 judge가 판정하지 않는다.

━━━━━━━━━━━━━━━━━━━━
[판정 기준]
━━━━━━━━━━━━━━━━━━━━
- PASS: 위 항목 중 후보 텍스트에서 실제로 인용 가능한 위반이 하나도 없음
- RETRY: 일부 문장 수정으로 해결 가능한 위반
- FAIL: 구조가 심각하게 깨졌거나 규칙을 전반적으로 위반

━━━━━━━━━━━━━━━━━━━━
[출력 형식(JSON only)]
━━━━━━━━━━━━━━━━━━━━
{
  "verdict": "PASS" | "RETRY" | "FAIL",
  "reasons": ["..."],
  "fix_instructions": ["..."],
  "violations": {
    "hallucinated_numbers": false,
    "judgmental_tone": false,
    "advice_present": false,
    "clinical_term_exposure": false,
    "time_rule_violation": false,
    "missing_evidence": false,
    "duplicates": false
  }
}
"""

DEFAULT_VIOLATIONS = {
    "hallucinated_numbers": False,
    "judgmental_tone": False,
    "advice_present": False,
    "clinical_term_exposure": False,
    "time_rule_violation": False,
    "missing_evidence": False,
    "duplicates": False,
    "evidence_ignored": False,
}


def _interpretations_reference_evidence(
    pattern_candidates: Dict[str, Any],
    retrieved_evidence: Optional[List[Dict[str, Any]]],
) -> bool:
    """근거가 무시되지 않고 '연결'되었는지 판단한다.

    재정의: 출처 텍스트 단서("전문 자료" 등) 검사를 제거하고,
    각 후보가 실제 근거 데이터(evidence.metrics_used·numbers)를 비어있지 않게
    담고 있는지로 판단한다. 출처 표현을 사용자 텍스트에 노출하도록 강요하지 않는다.
    """
    if not retrieved_evidence:
        return True
    candidates = pattern_candidates.get("pattern_candidates") or []
    if not isinstance(candidates, list):
        return False
    # 후보가 0개면 근거를 연결할 대상 자체가 없으므로 미연결 위반으로 보지 않는다.
    # 단, writer 실패(writer_error=True) 빈 배열은 통과시키지 않는다. 정상 "패턴 없음"만 통과.
    if len(candidates) == 0:
        return not bool(pattern_candidates.get("writer_error"))
    # 모든 후보가 metrics_used(1개 이상)와 numbers(1개 이상)를 가지면 "근거 연결됨"으로 본다.
    for c in candidates:
        if not isinstance(c, dict):
            return False
        evidence = c.get("evidence")
        if not isinstance(evidence, dict):
            return False
        metrics_used = evidence.get("metrics_used")
        numbers = evidence.get("numbers")
        if not isinstance(metrics_used, list) or len(metrics_used) == 0:
            return False
        if not isinstance(numbers, list) or len(numbers) == 0:
            return False
    return True


def run_llm_judge(
    pattern_candidates: Dict[str, Any],
    *,
    snapshot: Optional[Dict[str, Any]] = None,
    retrieved_evidence: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    체크인 검수자 시스템 프롬프트로 GPT-4o-mini를 호출해 규칙 위반 여부를 판단합니다.

    Args:
        pattern_candidates: writer 출력 전체(dict) 또는 pattern_candidates 배열을 담은 dict.
        snapshot: 체크인 스냅샷 원본(선택)
        retrieved_evidence: 검색된 근거 목록(선택)

    Returns:
        {
            "verdict": "PASS" / "RETRY" / "FAIL",
            "reasons": ["..."],
            "fix_instructions": ["..."],
            "violations": { "hallucinated_numbers": bool, ... },
            "raw": "..."  # 파싱 실패 시에도 있으면 포함
        }
        파싱 실패 시 verdict는 "FAIL", reasons 등은 빈 값/기본값으로 반환.
    """
    # writer 실패로 인한 빈 배열(writer_error=True)은 LLM 호출 없이 FAIL 처리한다.
    # 정상 "패턴 없음"(writer_error 없음)과 달리, 후보가 비어 있어도 통과시키지 않는다.
    if isinstance(pattern_candidates, dict) and pattern_candidates.get("writer_error"):
        candidates = pattern_candidates.get("pattern_candidates")
        if not isinstance(candidates, list) or len(candidates) == 0:
            violations = dict(DEFAULT_VIOLATIONS)
            violations["missing_evidence"] = True
            return {
                "verdict": "FAIL",
                "reasons": ["writer 단계 실패로 패턴 후보가 비어 있습니다(writer_error=true)."],
                "fix_instructions": ["writer 호출 실패 원인을 확인한 뒤 패턴 후보를 다시 생성하세요."],
                "violations": violations,
                "raw": "",
            }

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    model = os.getenv("OPENAI_JUDGE_MODEL", DEFAULT_MODEL)

    # judge LLM에는 검사 대상(후보 텍스트 + snapshot)만 전달한다.
    # retrieved_evidence(임상 출처) 원문은 judge 입력에서 제외해, 모델이 출처 용어를
    # 사용자 노출로 오판하는 false positive를 구조적으로 차단한다.
    # (evidence_ignored 계산은 아래 _interpretations_reference_evidence가 retrieved_evidence를 직접 사용한다.)
    payload = {
        "pattern_candidates": pattern_candidates,
        "snapshot": snapshot or {},
    }
    user_content = json.dumps(payload, ensure_ascii=False)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
        )
        raw = (response.choices[0].message.content or "").strip()
    except Exception as e:
        logger.warning("llm_judge API call failed: %s", e)
        return {
            "verdict": "FAIL",
            "reasons": [str(e)],
            "fix_instructions": [],
            "violations": dict(DEFAULT_VIOLATIONS),
            "raw": "",
        }

    if not raw:
        return {
            "verdict": "FAIL",
            "reasons": ["Empty judge output"],
            "fix_instructions": [],
            "violations": dict(DEFAULT_VIOLATIONS),
            "raw": "",
        }

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.warning("llm_judge JSON parse failed: %s", e)
        return {
            "verdict": "FAIL",
            "reasons": [f"JSON parse error: {e}"],
            "fix_instructions": [],
            "violations": dict(DEFAULT_VIOLATIONS),
            "raw": raw,
        }

    verdict = (data.get("verdict") or "FAIL").strip().upper()
    if verdict not in ("PASS", "RETRY", "FAIL"):
        verdict = "FAIL"

    reasons = data.get("reasons")
    if not isinstance(reasons, list):
        reasons = [str(reasons)] if reasons else []

    fix_instructions = data.get("fix_instructions")
    if not isinstance(fix_instructions, list):
        fix_instructions = []

    violations = data.get("violations")
    if not isinstance(violations, dict):
        violations = dict(DEFAULT_VIOLATIONS)
    else:
        for key in DEFAULT_VIOLATIONS:
            if key not in violations:
                violations[key] = DEFAULT_VIOLATIONS[key]
        # 여분 키는 제거하지 않고 그대로 둠 (호환용)

    if retrieved_evidence and not _interpretations_reference_evidence(pattern_candidates, retrieved_evidence):
        reasons.append("retrieved_evidence가 있는데 일부 후보에 근거 데이터(evidence.metrics_used/numbers)가 연결되지 않았습니다.")
        fix_instructions.append("각 후보의 evidence.metrics_used와 numbers를 비어있지 않게 채워 실제 근거 수치와 연결하세요.")
        violations["evidence_ignored"] = True
        if verdict == "PASS":
            verdict = "RETRY"

    return {
        "verdict": verdict,
        "reasons": reasons,
        "fix_instructions": fix_instructions,
        "violations": violations,
        "raw": raw,
    }
