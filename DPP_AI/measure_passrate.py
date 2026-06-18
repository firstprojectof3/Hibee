"""
4.2.1 AI 파이프라인 품질 검증 통과율 — 본 측정 스크립트

사용법 (DPP_AI 디렉터리에 두고, DB 연결된 로컬 환경에서 실행):
    cd ~/Desktop/DPP/DPP_AI
    python3 measure_passrate.py

전제:
  - test_cases.json 이 같은 디렉터리에 있어야 함
  - DATABASE_URL / OPENAI_API_KEY 가 .env 또는 환경에 설정돼 있어야 retrieval이 실제로 동작
  - retrieval이 도는 환경에서 최종 verdict 기준으로 측정

출력:
  - passrate_result.csv : 케이스별 상세 (보고서 표 4-2.1 원자료)
  - 콘솔 : 그룹별 통과율 요약
"""

import json
import os
import sys
import csv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
    override=True,
)

# 실제 파이프라인 import (경로는 환경에 맞게 확인 필요)
from app.services.checkin_pipeline import run_checkin_pipeline  # noqa: E402


def load_cases(path="test_cases.json"):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def group_of(case_id):
    if case_id.startswith("normal"):
        return "normal"
    if case_id.startswith("boundary"):
        return "boundary"
    return "anomaly"


def run_one(case):
    """한 케이스를 파이프라인에 통과시키고 결과를 평탄화해서 반환."""
    input_data = {
        "snapshot": case["snapshot"],
        "user_configs": case.get("user_configs", {}),
    }
    try:
        result = run_checkin_pipeline(input_data, log_to_db=False)
    except Exception as e:  # 파이프라인 자체가 터지는 경우도 기록
        return {
            "id": case["id"],
            "intent": case.get("_intent", ""),
            "group": group_of(case["id"]),
            "candidate_count": "ERROR",
            "deterministic": "ERROR",
            "judge_verdict": "ERROR",
            "final_verdict": "ERROR",
            "fail_reasons": f"pipeline exception: {e}",
        }

    # 반환 구조는 환경마다 키가 다를 수 있어 방어적으로 접근.
    det = result.get("deterministic_result") or {}
    judge = result.get("judge_result") or {}
    writer_out = result.get("writer_output") or {}
    candidates = writer_out.get("pattern_candidates", [])

    det_passed = det.get("passed")
    judge_verdict = judge.get("verdict")
    final_verdict = result.get("final_verdict")

    # 실패 사유 수집
    reasons = []
    if det.get("errors"):
        reasons += [f"det:{e}" for e in det["errors"]]
    if judge.get("reasons"):
        reasons += [f"judge:{r}" for r in judge["reasons"]]
    violations = judge.get("violations") or {}
    true_violations = [k for k, v in violations.items() if v]
    if true_violations:
        reasons.append("violations:" + ",".join(true_violations))

    return {
        "id": case["id"],
        "intent": case.get("_intent", ""),
        "group": group_of(case["id"]),
        "candidate_count": len(candidates) if isinstance(candidates, list) else "?",
        "deterministic": "PASS" if det_passed is True else ("FAIL" if det_passed is False else "?"),
        "judge_verdict": judge_verdict or "-",
        "final_verdict": final_verdict or "-",
        "fail_reasons": " | ".join(reasons) if reasons else "",
    }


def main():
    cases = load_cases()
    rows = []
    for i, c in enumerate(cases, 1):
        print(f"[{i}/{len(cases)}] {c['id']} 측정 중...", flush=True)
        rows.append(run_one(c))

    # CSV 저장
    fieldnames = ["id", "group", "intent", "candidate_count",
                  "deterministic", "judge_verdict", "final_verdict", "fail_reasons"]
    with open("passrate_result.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    # 그룹별 집계
    def rate(group, predicate):
        items = [r for r in rows if r["group"] == group]
        if not items:
            return 0, 0
        ok = sum(1 for r in items if predicate(r))
        return ok, len(items)

    # deterministic 단계 통과율 (전체)
    det_ok = sum(1 for r in rows if r["deterministic"] == "PASS")
    # 최종 verdict PASS (정상+경계만 = 서비스 가용 통과율)
    avail_ok, avail_n = rate("normal", lambda r: r["final_verdict"] == "PASS")
    b_ok, b_n = rate("boundary", lambda r: r["final_verdict"] == "PASS")
    serv_ok = avail_ok + b_ok
    serv_n = avail_n + b_n

    print("\n" + "=" * 60)
    print("4.2.1 통과율 측정 결과")
    print("=" * 60)
    print(f"전체 케이스: {len(rows)}개 (정상 {avail_n} / 경계 {b_n} / 이상 {len(rows)-serv_n})")
    print(f"\n[Deterministic QA 통과율] {det_ok}/{len(rows)} = {det_ok/len(rows):.1%}  (기준 ≥90%)")
    print(f"[서비스 가용 통과율 (정상+경계, 최종 PASS)] {serv_ok}/{serv_n} = {serv_ok/serv_n:.1%}  (기준 ≥80%)")
    print("\n[이상 케이스 처리 — 개별 확인]")
    for r in rows:
        if r["group"] == "anomaly":
            print(f"  {r['id']}: final={r['final_verdict']}, 후보={r['candidate_count']}, 사유={r['fail_reasons'][:60]}")
    print("\n상세는 passrate_result.csv 참조")
    print("=" * 60)


if __name__ == "__main__":
    main()
