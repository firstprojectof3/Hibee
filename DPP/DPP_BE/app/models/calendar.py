
from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, Date, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),nullable=False)
    #
    title = Column(String(100), nullable=True)
    description=Column(Text,nullable=True)
    Category=Column(String(50),default="Uncategorized",nullable=False)

    # 관계 설정
    user=relationship("Users",back_populates="calendar_events")


class CheckIn(Base):
    __tablename__ = "daily_checkins"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)
    date = Column(Date,nullable=False, server_default=func.current_date())
    # 
    generated_question = Column(Text,nullable=True)
    #
    user_answer = Column(String(50),nullable=False)
    user_answer_text = Column(Text,nullable=True)

    is_answered = Column(Boolean,default=False,nullable=False)
    is_text_generated = Column(Boolean,default=False,nullable=False)
    # 관계 설정
    user = relationship("Users",back_populates="daily_checkins")



class DailyReports(Base):
    __tablename__ = "daily_reports"
    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer, ForeignKey("users.id"),nullable=False)

    date = Column(Date,nullable=False)
    content = Column(Text,nullable=True)

    total_time = Column(Integer,default=0)
    late_night_usage = Column(Integer, default=0)

    category_usage = Column(JSON,nullable=True)

    # 관계 설정
    user=relationship("Users",back_populates="daily_reports")


class WeeklyReports(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer,primary_key=True,index=True)
    user_id = Column(Integer,ForeignKey("users.id"),nullable=False)

    date_week = Column(String(100),nullable=False)

    content_week = Column(Text,nullable=True)

    #
    total_time_avg = Column(Float,default=0.0)
    late_night_usage_avg = Column(Float,default=0.0)

    category_usage_avg = Column(JSON,nullable=True)

    # 관계 설정
    user=relationship("Users",back_populates="weekly_reports")