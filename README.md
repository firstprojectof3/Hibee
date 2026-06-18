# Dolphin Pod 🐬

**과도한 디지털 자극에 노출된 현대인을 위해, 스마트폰 사용 패턴을 분석하여 무의식적인 충동 행동을 게임형 보상 시스템으로 개선하는 자기통제(Self-regulation) 애플리케이션**

---

## 목차
1. [프로젝트 설명](#1-프로젝트-설명)
2. [소스 코드 설명 (Source Code)](#2-소스-코드-설명-source-code)
3. [How to Build](#3-how-to-build)
4. [How to Install](#4-how-to-install)
5. [How to Test](#5-how-to-test)
6. [Sample Data 설명](#6-sample-data-설명)
7. [Database / 사용 데이터](#7-database--사용-데이터)
8. [사용한 오픈소스](#8-사용한-오픈소스)
9. [Team HiBee](#9-team-hibee)

---

## 1. 프로젝트 설명

Dolphin Pod는 스마트폰 과다 사용으로 인한 도파민 과소비 문제를 해결하기 위한 **데이터 기반 자기통제 모바일 애플리케이션**입니다.

기존 디지털 웰빙 앱이 *사용 시간 차단·강제 제한*에 의존하는 것과 달리, Dolphin Pod는 사용자의 실제 **사용 패턴 · 알림 반응 · 감정 상태 데이터를 통합 분석**하여 사용자가 자신의 행동을 이해하고 자율적으로 조절하도록 돕습니다.

### 문제 정의
현대 모바일 환경은 알림·숏폼·반복 자극을 통해 사용자의 무의식적 반응을 유도합니다. 사용자는 자신의 습관을 정확히 인지하지 못한 채 스마트폰을 반복 사용하게 되며, 차단 중심 해결책은 거부감과 낮은 지속성이라는 한계를 가집니다. Dolphin Pod는 **차단이 아닌 이해**를 출발점으로 삼아 행동 패턴을 데이터로 드러냅니다.

### 핵심 기능
- 📊 **On-device Usage Analysis** — Android `UsageStatsManager` 기반 총 사용 시간·패턴 수집
- 🔔 **Notification Pattern Tracking** — `NotificationListenerService` 기반 알림 자동 수집 (앱 실행 여부 무관)
- 🧠 **Daily Check-in (QnA)** — 하루 1회 감정 상태·의지력·목표 달성도 입력 (하루 단위 단일 레코드)
- 🤖 **AI-based Personalized Report** — 사용 데이터 + 체크인 데이터를 결합한 개인화 리포트 생성
- 🐟 **Gamification** — 업적/캐릭터/챌린지·소셜 기능으로 자기조절 동기 부여

### 설계 원칙
- **FE–BE–AI 파이프라인 분리** — 사용자 데이터 보호 및 AI 교체 가능성을 고려한 단계 분리
- **패턴은 가설이지 처방이 아님** — AI 출력은 관찰적 표현만 사용, 조언 표현 금지
- **선택적 데이터베이스** — `DATABASE_URL` 없이도 백엔드·AI 서버 모두 정상 기동 (graceful fallback)

---

## 2. 소스 코드 설명 (Source Code)

세 개의 서비스로 구성된 모노레포입니다.

| 서비스 | 디렉토리 | 포트 | 스택 |
|--------|----------|------|------|
| 프론트엔드 (FE) | `DPP/DPP_FE/` | — | React Native 0.83 (Android) + TypeScript |
| 백엔드 (BE) | `DPP/DPP_BE/` | 8000 | FastAPI + SQLAlchemy + PostgreSQL |
| AI 서버 (AI) | `DPP_AI/` | 8001 | FastAPI + OpenAI / Anthropic API |
| AI 테스트 프레임워크 | `ai-test/` | — | Node.js (프롬프트/입력 회귀 테스트) |

### 디렉토리 구조 (요약)
```
DPP/
├── DPP/
│   ├── DPP_BE/                  # 백엔드 (게이트웨이 + 비즈니스 로직)
│   │   ├── main.py             # FastAPI 진입점 (포트 8000)
│   │   ├── app/
│   │   │   ├── api/v1/endpoints/   # logs, auth, dashboard, report, checkin, social, ...
│   │   │   ├── models/             # SQLAlchemy ORM (user, usage_log, reports, ...)
│   │   │   ├── schemas/            # Pydantic 스키마
│   │   │   └── core/               # config, database, auth, jwt
│   │   ├── services/               # AI 연동, 리포트/챌린지/업적 엔진
│   │   ├── alembic/                # DB 마이그레이션
│   │   └── requirements.txt
│   ├── DPP_FE/                  # React Native Android 앱
│   │   ├── src/
│   │   │   ├── features/           # onboarding, dashboard, checkin, report, social, ...
│   │   │   ├── navigation/         # React Navigation 스택/탭
│   │   │   ├── services/api/       # BE 통신 클라이언트
│   │   │   └── store/              # zustand 상태 관리
│   │   ├── android/                # 네이티브 모듈 (UsageStats, Notification 수집)
│   │   └── package.json
│   └── docker-compose.yml
├── DPP_AI/                      # AI 파이프라인 서버 (포트 8001)
│   ├── app/
│   │   ├── main.py             # FastAPI 진입점
│   │   ├── routers/            # checkin_question, checkin_pipeline, report_pipeline
│   │   └── services/           # writer, deterministic_check, llm_judge, report_writer/judge
│   ├── prompts/               # 버전 관리 프롬프트 (v1/v2)
│   ├── promptfooconfig.yaml   # 프롬프트 회귀 테스트 설정
│   ├── test_pipeline.py       # 파이프라인 유닛 테스트
│   └── requirements.txt
└── ai-test/                    # 프롬프트/입력 자산 + 직접 호출 테스트 러너
    ├── prompts/               # policy.txt, step{1,2,3}.txt
    ├── inputs/                # 샘플 입력 JSON (sample data)
    └── run_test.mjs
```

### AI 파이프라인 아키텍처

**체크인 파이프라인 (`POST /ai/checkin-pipeline`)** — 3단계, 각 단계를 `qa_results`에 기록
1. **checkin_writer** (GPT) — 일일 사용량 스냅샷으로부터 0~5개 패턴 후보 생성 (사실 관찰, 조언 아님)
2. **deterministic_check** (Python/regex) — 스키마·타입·금지 표현 검증 → PASS/FAIL
3. **llm_judge** (GPT) — 정성적 품질 검토 → PASS/RETRY/FAIL

**리포트 파이프라인 (`POST /ai/report-pipeline`)**
1. **report_writer** (Claude Sonnet) — 선택된 패턴 + KPT 피드백 기반 자연어 일일 리포트 생성
2. **report_judge** (GPT) — 어조·정확성·길이 검증 → PASS/REWRITE/FALLBACK

**체크인 질문 생성 (`POST /ai/checkin-question`)** — 3단계 문맥 인식 질문 생성 (프롬프트는 `ai-test/prompts/`에서 로드)

### 데이터 흐름
```
모바일(UsageStatsManager / NotificationListener)
   → POST /api/v1/logs (DPP_BE:8000)
   → UsageLog ORM → PostgreSQL
   → DPP_BE → DPP_AI(:8001) 파이프라인 호출 → 개인화 리포트
```

---

## 3. How to Build

### 사전 요구사항 (Prerequisites)
| 도구 | 권장 버전 |
|------|-----------|
| Python | 3.10+ |
| Node.js | 20+ |
| JDK | 17 (React Native 0.83) |
| Android SDK | compileSdk 36 / minSdk 24 / build-tools 36.0.0 |
| Android NDK | 27.1.12297006 |
| PostgreSQL | 14+ (선택 — 없으면 fallback 동작) |

### 3-1. AI 서버 빌드 (`DPP_AI`)
```bash
cd DPP_AI
python -m venv venv
source venv/bin/activate          # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 3-2. 백엔드 빌드 (`DPP/DPP_BE`)
```bash
cd DPP/DPP_BE
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# (DB 사용 시) 스키마 마이그레이션
alembic upgrade head
```

### 3-3. 프론트엔드 빌드 (`DPP/DPP_FE`)
```bash
cd DPP/DPP_FE
npm install

# 디버그 APK 빌드
cd android
./gradlew assembleDebug        # 산출물: android/app/build/outputs/apk/debug/app-debug.apk

# 릴리즈 APK 빌드
./gradlew assembleRelease
```

---

## 4. How to Install

### 4-1. 환경변수 설정

각 서비스 루트에 `.env` 파일을 생성합니다. (실제 키 값은 절대 커밋하지 마세요.)

**`DPP_AI/.env`**
```env
OPENAI_API_KEY=sk-...                 # 필수
ANTHROPIC_API_KEY=sk-ant-...          # 리포트 생성(Claude)용
AI_TEST_ROOT=/absolute/path/to/DPP/ai-test   # 필수 (프롬프트/입력 파일 경로)
OPENAI_MODEL=gpt-4o-mini              # 사용 모델
CHECKIN_SKIP_LLM_JUDGE=0             # 0=judge 활성/측정, 1=생략/데모
DATABASE_URL=postgresql://user:pass@host:5432/dbname   # 선택 (qa_results 로깅)
```

**`DPP/DPP_BE/.env`**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname   # 선택
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
JWT_SECRET_KEY=your-secret
```

> `AI_TEST_ROOT`, `OPENAI_API_KEY`가 없으면 AI 서버는 기동되지 않습니다(의도된 안전장치).

### 4-2. 서비스 실행

**AI 서버 (포트 8001)**
```bash
cd DPP_AI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
# 헬스 체크: curl http://localhost:8001/health
```

**백엔드 (포트 8000)**
```bash
cd DPP/DPP_BE
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# 헬스 체크: curl http://localhost:8000/
```

**프론트엔드 (Android 기기/에뮬레이터)**
```bash
cd DPP/DPP_FE
# 1) BE 주소 설정: src/services/api/client.ts 의 BASE_URL 을
#    실행 PC의 로컬 IP로 변경 (예: http://192.168.0.10:8000)
npm start                # Metro 번들러 실행
npm run android          # 연결된 기기/에뮬레이터에 앱 설치 및 실행
```

> 실기기 사용 시 휴대폰과 PC가 동일 네트워크에 있어야 하며, `UsageStats`·`Notification` 접근 권한을 앱 내 온보딩에서 허용해야 데이터 수집이 동작합니다.

### 4-3. (선택) Docker 게이트웨이
`DPP/DPP_BE/Dockerfile` 로 백엔드 이미지를 빌드할 수 있습니다.
```bash
cd DPP/DPP_BE
docker build -t dpp-be .
docker run -p 8000:8000 --env-file .env dpp-be
```

---

## 5. How to Test

### 5-1. AI 파이프라인 유닛 테스트 (HTTP 서버 불필요)
```bash
cd DPP_AI
python test_pipeline.py     # 체크인 + 리포트 파이프라인 흐름 검증
```

### 5-2. AI 품질 지표 측정
```bash
cd DPP_AI
python measure_passrate.py       # 통과율 측정 → passrate_result.csv
python measure_consistency.py    # 일관성 측정 → consistency_result.csv
```
(전제: `test_cases.json` 이 같은 디렉터리에 있고, `.env`에 `OPENAI_API_KEY`/`DATABASE_URL` 설정)

### 5-3. AI 테스트 프레임워크 (OpenAI 직접 호출)
```bash
cd ai-test
npm install
node run_test.mjs --input inputs/checkin_A_day1_step1.json --server http://localhost:8001
```

### 5-4. 프롬프트 회귀 테스트 (CI 동일)
```bash
cd DPP_AI
npm install -g promptfoo
npx promptfoo eval --output .promptfoo/output.json --no-cache
node scripts/compare-regression.js   # exit 0 = 통과, exit 1 = v2 < v1 회귀 감지
```
> GitHub Actions(`.github/workflows/prompt-regression.yml`)는 `DPP_AI/prompts/**`, `DPP_AI/services/**`, `ai-test/prompts/**` 수정 PR에서 자동 실행되어 v2 ≥ v1 품질을 강제합니다.

### 5-5. 프론트엔드 테스트
```bash
cd DPP/DPP_FE
npm test        # Jest
npm run lint    # ESLint
```

---

## 6. Sample Data 설명

`ai-test/inputs/` 에 파이프라인 테스트용 샘플 입력(JSON)이 포함되어 있습니다.

| 파일 | 용도 |
|------|------|
| `demo_minjee_checkin_pipeline.json` | 체크인 파이프라인 데모 입력 (가상 사용자 "민지") |
| `demo_minjee_report_pipeline.json` | 리포트 파이프라인 데모 입력 |
| `demo_minjee_checkin_question.json` | 체크인 질문 생성 데모 입력 |
| `checkin_A_day1_step{1,2}.json` | 체크인 질문 단계별 입력 |
| `pattern_case_strong / balanced / keep.json` | 패턴 생성 강도별 케이스 |
| `report_c1.json`, `checkin_c1.json` | 리포트/체크인 단일 케이스 |

**입력 스키마 예 (사용량 스냅샷):**
```json
{
  "snapshot": {
    "date": "2026-03-05",
    "total_usage_sec": 16200,
    "unlock_count": 23,
    "time_of_day_buckets_sec": { "morning": 3600, "afternoon": 5400, "evening": 4200 },
    "max_continuous_sec": 2700
  },
  "user_configs": { "daily_goal_sec": 14400 }
}
```
모든 샘플 데이터는 **가공된 가상 데이터**이며 실제 사용자 개인정보를 포함하지 않습니다. 출력 결과물(`passrate_result.csv`, `consistency_result.csv`)은 보고서용 측정 원자료입니다.

---

## 7. Database / 사용 데이터

- **서버 DB**: PostgreSQL (`pgvector` 확장 — 근거 검색용 임베딩 저장)
- **로컬 저장**: AsyncStorage (앱 온디바이스 캐시)
- **ORM**: SQLAlchemy + Alembic 마이그레이션 (`DPP/DPP_BE/alembic/`)
- **주요 테이블**
  - `users` — 사용자 + 사용로그/체크인/리포트/게임화/소셜 관계
  - `usage_logs` — package_name, usage_duration, timestamps, category
  - `qa_results` (AI) — 파이프라인 단계 실행 로그 (run_id, step, status, inputs, outputs, errors)
- **선택적 DB 설계**: `DATABASE_URL` 미설정 시 두 FastAPI 서비스 모두 정상 기동하며, AI 서버는 `qa_results`를 로거로만 출력합니다.

---

## 8. 사용한 오픈소스

| 영역 | 오픈소스 | 용도 |
|------|----------|------|
| AI/BE 웹 서버 | FastAPI, Uvicorn | REST API 서버 |
| ORM/DB | SQLAlchemy, Alembic, psycopg2, pgvector | 데이터 영속화·마이그레이션·벡터 검색 |
| 데이터 검증 | Pydantic | 스키마 검증 |
| LLM SDK | `openai`, `anthropic` | GPT(검증/판단), Claude(리포트 작성) |
| 환경설정 | python-dotenv | 환경변수 로딩 |
| 인증/보안 | passlib(bcrypt), python-jose | 비밀번호 해싱·JWT |
| 문서 처리 | PyMuPDF | 전문 지식 PDF 인제스트 |
| 모바일 | React Native 0.83, React Navigation, zustand | 앱 프레임워크·내비게이션·상태관리 |
| 모바일 부가 | @react-native-async-storage, @notifee/react-native, react-native-svg, @react-native-google-signin | 로컬 저장·알림·그래픽·소셜 로그인 |
| 테스트 | Jest, ESLint, promptfoo | 유닛 테스트·린트·프롬프트 회귀 |

> 외부 AI 서비스: OpenAI API, Anthropic Claude API (API Key 필요). 사용 모델은 `OPENAI_MODEL` 환경변수로 교체 가능합니다.

---

## 9. Team HiBee

- **김호연** — AI 파이프라인 설계 및 구현, 멀티 에이전트 기반 품질 검증, AI 및 시스템 통합 테스트
- **양시은** — 사용자 흐름·화면·멀티 에이전트 설계, API 연동 및 사용자 입력 상태 
처리, UI 안정화·발표 자료 디자인 및 시각화 
- **이승현** — BE 및 DB 설계, DB 구조 및 RAG 설계, API 설계 및 구현, DB와 API 구조 
고도화 및 성능 검증 


