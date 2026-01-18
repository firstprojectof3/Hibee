
from unicodedata import category
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class RecommendedActions(Base):
    __tablename__ = "recommended_actions"

    id = Column(Integer,primary_key=True,index=True)

    category = Column(String(50), nullable=True)

    action_title = Column(String(50), nullable=True)

    content = Column(Text, nullable= True)

    difficulty = Column(Integer, default=1)

    recommendations = relationship("Recommendactions", back_populates="action")

class Recommendactions(Base):
    __tablename__ = "recommendactions"

    id = Column(Integer,primary_key=True, index = True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    action_id = Column(Integer, ForeignKey("recommended_actions.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계 정리
    user = relationship("Users", back_populates="recommendations")
    action = relationship("RecommendedActions", back_populates="recommendations")
    # 하나의 추천에는 하나의 피드백만 존재
    feedback = relationship("UserFeedback", uselist=False, back_populates="recommendation")


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    
    # 어떤 추천에 대한 피드백인가?
    recommendation_id = Column(Integer, ForeignKey("recommendactions.id"), nullable=False)
    
    # 평가 (3지 선다: 'GOOD', 'BAD', 'SOSO' 또는 이모지 저장)
    # (👍, 😵‍💫, 🤔)
    rating = Column(String(20), nullable=False)

    # 관계 정리
    recommendation = relationship("Recommendactions", back_populates="feedback")

