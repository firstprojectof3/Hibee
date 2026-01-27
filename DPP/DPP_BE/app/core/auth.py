
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException, status
import os

# 구글 클라우드 콘솔에서 발급받은 클라이언트 ID
GOOGLE_WEB_CLIENT_ID = os.getenv("GOOGLE_WEB_CLIENT_ID") 

def verify_google_token(token: str) -> dict:
    try:
        # 구글 공식 라이브러리 - 서명 위조 여부와 만료 시간을 자동으로 체크함.
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            GOOGLE_WEB_CLIENT_ID
        )

        # 토큰 발행처(iss)가 구글인지 최종 확인
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        # 검증 성공 시 사용자 정보(이메일, 이름 등) 반환
        return idinfo

    except ValueError as e:
        # 유효하지 않은 토큰일 경우 401 에러 발생
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )