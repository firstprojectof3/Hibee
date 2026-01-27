from unicodedata import category
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# 1. 안드로이드에서 보낼 데이터 형식 정의
class AppUsageLogBase(BaseModel):
    package_name: str
    app_name: str
    usage_time: int  
    start_time: datetime
    end_time: datetime
    unlock_count: int=0
    category: Optional[str] = "Uncategorized"
    is_night_mode: Optional[bool] = False

# 2. 안드로이드 -> 서버 
class AppUsageLogCreate(BaseModel):
    logs : List[AppUsageLogBase]
    unlock_count : int

# 3. 서버 -> 클라이언트
# 상속 기능
class AppUsageLogResponse(BaseModel):
    id : int
    user_id : int
    package_name: str     
    app_name: str
    usage_duration: int   
    first_time_stamp: int
    last_time_stamp: int
    unlock_count: int
    is_night_mode: bool
    category: Optional[str] = "Uncategorized"

    class Config: 
        from_attributes = True