"""
4.2.2 체크인 응답 검수 일관성 (Writer 생성 일관성) — 본 측정 스크립트

측정 대상: 정상 12 + 경계 5 = 17개 케이스 (이상 케이스 제외)
측정 방법: 각 케이스를 5회 반복 생성 → 1회차 기준으로 나머지 4회 동일 여부 판정
          → 5회 중 4회 이상 동일이면 해당 케이스 PASS
          → 17개 중 PASS율 ≥ 85% 충족 시 합격
동일 판정: (a) tags Jaccard ≥ 0.7  (b) 임베딩 코사인 ≥ 0.85  두 지표 병행

사용법:
    cd ~/Desktop/DPP/DPP_AI
    python3 -u measure_consistency.py

출력:
    consistency_result.csv : 케이스별 tag/임베딩 일치 결과
    콘솔 : 두 지표별 PASS율 요약
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

import numpy as np  # noqa: E402
from openai import OpenAI  # noqa: E402

# writer를 직접 호출 (judge/deterministic 없이 생성 단계만 측정)
from app.services.checkin_writer import generate_pattern_candidates  # noqa: E402

client = OpenAI()

REPEAT = 5
TAG_THRESHOLD = 0.7      # Jaccard
EMB_THRESHOLD = 0.85     # cosine
MIN_MATCH = 4            # 5회 중 4회 이상 동일 → 케이스 PASS
PASS_RATE_TARGET = 0.85  # 17개 중 PASS율 기준선


def load_target_cases(path="test_cases.json"):
    """정상 + 경계 케이스만 반환 (이상 케이스 제외)."""
    with open(path, encoding="utf-8") as f:
        cases = json.load(f)
    return [c for c in cases if c["id"].startswith(("normal", "boundary"))]


def pattern_text(out):
    """한 회차 출력을 비교용 단일 텍스트로 직렬화."""
    cands = out.get("pattern_candidates", []) if isinstance(out, dict) else []
    parts = []
    for c in cands:
        if isinstance(c, dict):
            parts.append(
                f"{c.get('label','')} {c.get('observation','')} {c.get('interpretation','')}"
            )
    return " ".join(parts).strip()


def tag_set(out):
    tags = set()
    cands = out.get("pattern_candidates", []) if isinstance(out, dict) else []
    for c in cands:
        if isinstance(c, dict):
            tags.update(c.get("tags", []) or [])
    return tags


def jaccard(a, b):
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def embed(text):
    if not text:
        return None
    r = client.embeddings.create(model="text-embedding-3-small", input=text)
    return np.array(r.data[0].embedding)


def cosine(a, b):
    if a is None or b is None:
        return 0.0
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(a @ b / denom)


def main():
    cases = load_target_cases()
    rows = []
    tag_pass = emb_pass = 0

    for idx, case in enumerate(cases, 1):
        print(f"[{idx}/{len(cases)}] {case['id']} 5회 반복 중...", flush=True)
        outs = []
        for _ in range(REPEAT):
            try:
                out = generate_pattern_candidates(case["snapshot"], case.get("user_configs", {}))
            except Exception as e:
                out = {"pattern_candidates": [], "_error": str(e)}
            outs.append(out)

        ref_tags = tag_set(outs[0])
        ref_emb = embed(pattern_text(outs[0]))

        tag_matches = 1  # 기준 회차 자신 포함
        emb_matches = 1
        tag_scores = [1.0]
        emb_scores = [1.0]
        for o in outs[1:]:
            j = jaccard(ref_tags, tag_set(o))
            ce = cosine(ref_emb, embed(pattern_text(o)))
            tag_scores.append(round(j, 3))
            emb_scores.append(round(ce, 3))
            if j >= TAG_THRESHOLD:
                tag_matches += 1
            if ce >= EMB_THRESHOLD:
                emb_matches += 1

        tag_ok = tag_matches >= MIN_MATCH
        emb_ok = emb_matches >= MIN_MATCH
        tag_pass += tag_ok
        emb_pass += emb_ok

        rows.append({
            "id": case["id"],
            "group": "normal" if case["id"].startswith("normal") else "boundary",
            "cand_count_run1": len(outs[0].get("pattern_candidates", [])),
            "tag_match_count": tag_matches,
            "tag_verdict": "PASS" if tag_ok else "FAIL",
            "tag_scores": ";".join(str(s) for s in tag_scores),
            "emb_match_count": emb_matches,
            "emb_verdict": "PASS" if emb_ok else "FAIL",
            "emb_scores": ";".join(str(s) for s in emb_scores),
        })

    n = len(cases)
    fieldnames = ["id", "group", "cand_count_run1",
                  "tag_match_count", "tag_verdict", "tag_scores",
                  "emb_match_count", "emb_verdict", "emb_scores"]
    with open("consistency_result.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    print("\n" + "=" * 60)
    print("4.2.2 Writer 생성 일관성 측정 결과")
    print("=" * 60)
    print(f"측정 대상: 정상+경계 {n}개 케이스 · 각 5회 반복 · 4회 이상 동일 시 PASS")
    print(f"\n[tags 일치 기준]    PASS율 {tag_pass}/{n} = {tag_pass/n:.1%}  (기준 ≥{PASS_RATE_TARGET:.0%})")
    print(f"[임베딩 일치 기준]  PASS율 {emb_pass}/{n} = {emb_pass/n:.1%}  (기준 ≥{PASS_RATE_TARGET:.0%})")
    print("\n[FAIL 케이스]")
    any_fail = False
    for r in rows:
        if r["tag_verdict"] == "FAIL" or r["emb_verdict"] == "FAIL":
            any_fail = True
            print(f"  {r['id']}: tag={r['tag_verdict']}({r['tag_match_count']}/5), emb={r['emb_verdict']}({r['emb_match_count']}/5)")
    if not any_fail:
        print("  없음 — 전 케이스 두 지표 모두 PASS")
    print("\n상세는 consistency_result.csv 참조")
    print("=" * 60)


if __name__ == "__main__":
    main()
