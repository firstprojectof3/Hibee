from pydantic import BaseModel
from datetime import datetime
from typing import List

# 1. 안드로이드에서 보낼 데이터 형식 정의
class AppUsageLogBase(BaseModel):
    packagename: str
    app_name: str
    usage_time: int  
    start_time: datetime
    end_time: datetime

# 2. 안드로이드 -> 서버 
class AppUsageLogCreate(BaseModel):
    logs : List[AppUsageLogBase]

# 3. 서버 -> 클라이언트
# 상속 기능
class AppUsageLogResponse(AppUsageLogBase):
    id : int
    user_id : int