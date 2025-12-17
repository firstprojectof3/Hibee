# 🐬 Dolphin Pod (HiBee - Team 05)
> **사용자 맞춤형 앱 사용 패턴 분석 및 AI 기반 도파민 관리 솔루션**

[![University](https://img.shields.io/badge/University-Ewha%20W.%20Univ-green)](https://www.ewha.ac.kr) 
[![Course](https://img.shields.io/badge/Course-Capstone%20Design-orange)](https://cse.ewha.ac.kr/)
[![Track](https://img.shields.io/badge/Track-%EC%82%B0%ED%95%99%20%ED%8A%B8%EB%B1%99-blue)](#)

## 📌 Project Overview
**Dolphin Pod**는 현대인의 무분별한 스마트폰 사용과 '도파민 중독' 문제를 해결하기 위해 탄생했습니다. 단순히 앱을 강제 차단하는 기존 방식에서 벗어나, 사용자의 **앱 사용 로그**와 **주관적 감정 데이터**를 결합 분석하여 스스로 건강한 디지털 습관을 형성하도록 돕는 AI 가이드 서비스입니다.

### 🎯 주요 타겟
- 무의식적인 숏폼(Reels, Shorts 등) 시청으로 시간을 낭비하는 사용자
- 스마트폰 사용 후 공허함이나 불안감을 자주 느끼는 사용자
- 자신의 디지털 사용 습관을 데이터로 객관화하여 확인하고 싶은 사용자

---

## ✨ Key Features
1. **Dolphin Dashboard (실시간 분석)**
   - 안드로이드 `UsageStats` 데이터를 기반으로 앱별 사용 시간 및 빈도 시각화
2. **Emotion Check-in (감정 기록)**
   - 특정 앱 사용 전후의 감정 상태를 기록하여 심리적 의존도 파악
3. **AI Dopamine Report (개인화 리포트)**
   - GPT-4o API를 활용, 사용자의 일주일간 패턴을 분석하여 맞춤형 개선 가이드 제공
4. **Interactive Widget (동기 부여)**
   - 사용자의 개선 정도에 따라 반응하는 캐릭터 및 위젯 요소 제공

---

## 🛠 Tech Stack
### Frontend
- **Language:** Kotlin
- **Platform:** Android (Min SDK 26)
- **Library:** MPAndroidChart (데이터 시각화), Material Design Components

### Backend
- **Framework:** Spring Boot, JPA
- **Database:** MariaDB, Redis (캐싱)
- **Infrastructure:** AWS EC2, Docker

### AI & Data
- **Engine:** OpenAI GPT-4o API
- **Tool:** Python (데이터 전처리 및 분석)

---

## 📂 Project Structure
```text
├── android/          # Android 클라이언트 소스 코드
├── server/           # Spring Boot 기반 백엔드 서버
├── ai/               # AI 프롬프트 엔지니어링 및 데이터 분석 스크립트
└── docs/             # 프로젝트 기획 및 설계 문서
- **프로젝트명:** Healthy Dopamine Project (Hibee)  
- **트랙:** 산학  
- **팀원:** 김호연(2176117), 이승현(2171090), 양시은(2176209)  
- **최종 수정일:** 2025년 9월 11일  
