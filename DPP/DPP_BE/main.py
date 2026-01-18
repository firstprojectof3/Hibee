
from pydoc import describe
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, get_db
from app import models, schemas
from sqlalchemy.orm import Session
from app.models.usage_log import UsageLog
from app.models.user import Users
from sqlalchemy.orm import Session

# from fastapi.responses import JSONResponse
# import traceback

# 가상환경 설정 및 패키지 설치
# python -m venv venv
# .\venv\Scripts\activate
# pip install -r requirements.txt

# uvicorn app.main:app --reload

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

@app.get("/")
def dolphin_pod_check():
    return {
        "status" : "ok",
        "message" : " 🐬 돌고래들이 헤엄치고 있어요 "
    }

@app.post("/logs",response_model=dict)
def upload_logs(
    log_data:schemas.AppUsageLogCreate,
    db:Session=Depends(get_db)
):  
    for log_item in log_data.logs:
        new_log = UsageLog(
            user_id=1,  # 유저는 일단 1번으로 고정! (log_data에 없음)
            
            package_name=log_item.packagename,
            app_name=log_item.app_name,
            
            usage_duration=log_item.usage_time,
            
            first_time_stamp=int(log_item.start_time.timestamp() * 1000),
            last_time_stamp=int(log_item.end_time.timestamp() * 1000),
            
            category="Uncategorized",
            date=log_item.start_time # 날짜는 시작 시간으로 기록
        )

        db.add(new_log)
    db.commit()
    return {"status":"success", "message":f"{len(log_data.logs)}개 기록이 저장되었습니다."}


# API 엔드포인트 추가 예정

# from api.v1.endpoints import users, usage_logs
# app.include_router(users.router, prefix="/api/v1/users",tags=["users"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
