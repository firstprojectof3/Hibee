

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from sqlalchemy.orm import Session
from app.api.v1.endpoints.log import router as log_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.log import router as log_router
# from fastapi.responses import JSONResponse
# import traceback

# 가상환경 설정 및 패키지 설치
# python -m venv venv
# .\venv\Scripts\activate
# pip install -r requirements.txt

# uvicorn main:app --reload : 로컬 테스트용
#  uvicorn main:app --host 0.0.0.0 --port 8000 --reload : 외부 접속 허용
Base.metadata.create_all(bind=engine)

app=FastAPI(
    title="DPP API",
    description = "돌핀팟",
    version="1.0.0"
)

origins = ["*"]

# CORS 설정 (안하면 오류남)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(log_router, prefix="/api/v1/logs",tags=["logs"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
def dolphin_pod_check():
    return {
        "status" : "ok",
        "message" : " 🐬 돌고래들이 헤엄치고 있어요 "
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
