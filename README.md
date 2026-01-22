# Dolphin Pod 🐬  
**과도한 디지털 자극에 노출된 현대인들을 위해 스마트폰 사용 패턴을 분석하여 무의식적인 충동 행동을 게임형 보상 시스템으로 개선하는 자기통제 어플리케이션**

## 핵심 기술 코드
- FE-BE-AI 파이프라인, 개인화 리포트:  https://github.com/firstprojectof3/HiBee_HoYeon
- 사용자 입력(QnA), 알림 카테고라이징:  https://github.com/firstprojectof3/Hibee_Sieun
- 총 사용 시간 데이터 수집:  https://github.com/firstprojectof3/HiBee_SeungHyeon


## Overview
Dolphin Pod는 스마트폰 과다 사용으로 인한 도파민 과소비 문제를 해결하기 위한  
**데이터 기반 자기통제(Self-regulation) 모바일 애플리케이션**입니다.

기존의 디지털 웰빙 앱이 사용 시간 차단이나 강제 제한에 의존하는 것과 달리,  
Dolphin Pod는 사용자의 실제 **스마트폰 사용 패턴·알림 반응·감정 상태 데이터를 통합 분석**하여  
사용자가 자신의 행동을 이해하고 자율적으로 조절하도록 돕는 것을 목표로 합니다.

---

## 문제 정의
현대 모바일 환경은 알림, 숏폼 콘텐츠, 반복 자극을 통해 사용자의 무의식적 반응을 유도합니다.  
이로 인해 사용자는 자신의 사용 습관을 정확히 인지하지 못한 채 스마트폰을 반복적으로 사용하게 되며,  
기존의 차단 중심 해결책은 거부감과 낮은 지속성이라는 한계를 가집니다.

Dolphin Pod는 **차단이 아닌 이해**를 출발점으로 삼아,  
행동 패턴을 데이터로 드러내는 방식의 대안을 제시합니다.

---

## 핵심 기능
- 📊 **On-device Usage Analysis**  
  - Android UsageStatsManager 기반 총 사용 시간 및 패턴 수집
  - 백그라운드에서도 끊기지 않는 시간 집계 로직

- 🔔 **Notification Pattern Tracking**  
  - NotificationListenerService 기반 알림 자동 수집
  - 앱 실행 여부와 무관한 알림 이벤트 기록 (프라이버시 보호 설계)

- 🧠 **Daily Check-in (Simple QnA)**  
  - 하루 1회 감정 상태, 의지력, 목표 달성도 입력
  - 하루 단위 단일 레코드 구조로 정합성 확보

- 🤖 **AI-based Personalized Report**  
  - 사용 데이터 + 체크인 데이터를 결합한 개인화 리포트 생성
  - 사용자의 하루 행동 흐름을 자연어로 요약 및 피드백 제공

---

## 시스템 구조
Dolphin Pod는 확장성과 데이터 보호를 고려한 **3-Tier 구조**로 설계되었습니다.

- **Frontend**: React Native (Android)
- **Gateway Server**: Node.js
- **AI Server**: FastAPI + OpenAI API
- **Local Storage**: SQLite / Room
- **Database (Server)**: PostgreSQL

사용자 데이터는 단계적으로 전달되며,  
AI는 원본 데이터를 직접 다루지 않고 가공된 구조화 데이터만을 처리합니다.

---

## 핵심 기술
1. **FE–BE–AI Pipeline Separation**  
   - 사용자 데이터 보호 및 AI 교체 가능성을 고려한 단계 분리 구조

2. **Personalized Data Schema for AI Reporting**  
   - 사용자별 하루 데이터를 하나의 구조로 정의하여 개인화 리포트 생성

3. **On-device Data Collection under OS Constraints**  
   - Android OS 제약 환경에서 UsageStats 및 Notification 데이터를 보정·통합



## AI 사용 투명성
- AI는 판단 주체가 아닌 **설명 및 요약 도구**로 사용됩니다.
- 실제 Prompt, 입력 데이터 구조(JSON), 출력 결과가 명확히 정의되어 있습니다.
- 프롬프트 개선 과정과 한계점 또한 문서화되어 있습니다.

---

## 프로젝트 개발 현황
- MVP 단계 핵심 파이프라인 구현 완료
- 에뮬레이터 기반 전체 데이터 흐름 검증
- Android 실기기 테스트 및 데이터 축적 단계 진행 예정

---

## 향후 계획
- 실사용 데이터 기반 리포트 품질 고도화
- 개인화 시각화(차트) 강화
- 게이미피케이션 및 소셜 챌린지 기능 확장
- 다음 학기(그로쓰) 단계에서 베타 테스트 진행

---

## Team HiBee
- 김호연: 프로젝트 기획, FE–BE–AI 구조 설계, AI 서버 구축
- 양시은: 기능 기획, 데이터 구조 설계, 체크인 및 알림 수집 구조
- 이승현: Android Native 데이터 수집 로직 설계 및 구현

---


