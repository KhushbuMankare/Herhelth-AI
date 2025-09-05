from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import pickle
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
import logging
import os
from uuid import uuid4

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pcos_app.db")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    assessment_data = Column(Text, nullable=False)  # JSON string
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    recommendations = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PCOS Prediction API",
    description="API for PCOS risk prediction with user authentication",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and scaler
model = None
scaler = None

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

class PCOSInput(BaseModel):
    age: float
    weight: float
    height: float
    bmi: float
    blood_group: str
    pulse_rate: float
    rr: float
    hb: float
    cycle: str
    cycle_length: float
    marriage_status: str
    pregnant: str
    no_of_abortions: float
    i_beta_hcg_1: float
    i_beta_hcg_2: float
    fsh: float
    lh: float
    fsh_lh: float
    hip: float
    waist: float
    waist_hip_ratio: float
    tsh: float
    amh: float
    prl: float
    vit_d3: float
    prg: float
    rbs: float
    weight_gain: str
    hair_growth: str
    skin_darkening: str
    hair_loss: str
    pimples: str
    fast_food: str
    reg_exercise: str
    bp_systolic: float
    bp_diastolic: float
    follicle_no_l: float
    follicle_no_r: float
    avg_f_size_l: float
    avg_f_size_r: float
    endometrium: float

class PCOSOutput(BaseModel):
    id: int
    risk_score: float
    risk_level: str
    confidence: float
    recommendations: List[str]
    feature_importance: Dict[str, float]
    created_at: datetime

class AssessmentHistory(BaseModel):
    assessments: List[PCOSOutput]
    total_count: int

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def load_model():
    """Load the trained model and scaler from pickle files"""
    global model, scaler
    try:
        # Load your trained model
        with open('modelfinal1.pkl', 'rb') as f:
            model = pickle.load(f)
        
        # Load scaler if you have one
        try:
            with open('models/scaler.pkl', 'rb') as f:
                scaler = pickle.load(f)
        except FileNotFoundError:
            logger.warning("Scaler not found, proceeding without scaling")
            scaler = None
            
        logger.info("Model loaded successfully")
    except FileNotFoundError:
        logger.error("Model file not found. Please ensure pcos_model.pkl exists in models/ directory")
        raise

def preprocess_input(data: PCOSInput) -> np.ndarray:
    """Preprocess input data for model prediction"""
    
    # Convert categorical variables to numerical
    categorical_mappings = {
        'blood_group': {'A+': 0, 'A-': 1, 'B+': 2, 'B-': 3, 'AB+': 4, 'AB-': 5, 'O+': 6, 'O-': 7},
        'cycle': {'Regular': 0, 'Irregular': 1},
        'marriage_status': {'Married': 1, 'Unmarried': 0},
        'pregnant': {'Yes': 1, 'No': 0},
        'weight_gain': {'Yes': 1, 'No': 0},
        'hair_growth': {'Yes': 1, 'No': 0},
        'skin_darkening': {'Yes': 1, 'No': 0},
        'hair_loss': {'Yes': 1, 'No': 0},
        'pimples': {'Yes': 1, 'No': 0},
        'fast_food': {'Yes': 1, 'No': 0},
        'reg_exercise': {'Yes': 1, 'No': 0}
    }
    
    # Create feature array
    features = [
        data.age, data.weight, data.height, data.bmi,
        categorical_mappings['blood_group'].get(data.blood_group, 0),
        data.pulse_rate, data.rr, data.hb,
        categorical_mappings['cycle'].get(data.cycle, 0),
        data.cycle_length,
        categorical_mappings['marriage_status'].get(data.marriage_status, 0),
        categorical_mappings['pregnant'].get(data.pregnant, 0),
        data.no_of_abortions, data.i_beta_hcg_1, data.i_beta_hcg_2,
        data.fsh, data.lh, data.fsh_lh, data.hip, data.waist,
        data.waist_hip_ratio, data.tsh, data.amh, data.prl,
        data.vit_d3, data.prg, data.rbs,
        categorical_mappings['weight_gain'].get(data.weight_gain, 0),
        categorical_mappings['hair_growth'].get(data.hair_growth, 0),
        categorical_mappings['skin_darkening'].get(data.skin_darkening, 0),
        categorical_mappings['hair_loss'].get(data.hair_loss, 0),
        categorical_mappings['pimples'].get(data.pimples, 0),
        categorical_mappings['fast_food'].get(data.fast_food, 0),
        categorical_mappings['reg_exercise'].get(data.reg_exercise, 0),
        data.bp_systolic, data.bp_diastolic,
        data.follicle_no_l, data.follicle_no_r,
        data.avg_f_size_l, data.avg_f_size_r, data.endometrium
    ]
    
    features_array = np.array(features).reshape(1, -1)
    
    # Apply scaling if scaler is available
    if scaler is not None:
        features_array = scaler.transform(features_array)
    
    return features_array

def generate_recommendations(risk_score: float, input_data: PCOSInput) -> List[str]:
    """Generate personalized recommendations based on risk score and input data"""
    recommendations = []
    
    if risk_score > 0.7:
        recommendations.append("Consult with a gynecologist or endocrinologist immediately")
        recommendations.append("Consider comprehensive hormonal testing")
    elif risk_score > 0.5:
        recommendations.append("Schedule a consultation with a healthcare provider")
        recommendations.append("Monitor symptoms closely")
    
    # BMI-based recommendations
    if input_data.bmi > 25:
        recommendations.append("Focus on weight management through diet and exercise")
        recommendations.append("Consider consulting a nutritionist")
    
    # Exercise recommendations
    if input_data.reg_exercise == "No":
        recommendations.append("Incorporate regular physical activity (150 min/week)")
        recommendations.append("Start with low-impact exercises like walking or swimming")
    
    # Diet recommendations
    if input_data.fast_food == "Yes":
        recommendations.append("Reduce processed and fast food consumption")
        recommendations.append("Focus on whole foods and balanced nutrition")
    
    # Hormonal recommendations
    if input_data.fsh_lh > 2.5:
        recommendations.append("Monitor hormonal levels regularly")
    
    return recommendations

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model()
    except Exception as e:
        logger.warning(f"Could not load model: {e}")

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Assessment endpoints
@app.post("/assessments", response_model=PCOSOutput)
async def create_assessment(
    input_data: PCOSInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new PCOS assessment"""
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Make prediction using existing logic
        features = preprocess_input(input_data)
        
        if hasattr(model, 'predict_proba'):
            prediction_proba = model.predict_proba(features)[0]
            risk_score = float(prediction_proba[1])
            confidence = float(max(prediction_proba))
        else:
            prediction = model.predict(features)[0]
            risk_score = float(prediction)
            confidence = 0.8
        
        if risk_score >= 0.7:
            risk_level = "High"
        elif risk_score >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"
        
        recommendations = generate_recommendations(risk_score, input_data)
        
        feature_importance = {}
        if hasattr(model, 'feature_importances_'):
            feature_names = [
                'age', 'weight', 'height', 'bmi', 'blood_group', 'pulse_rate',
                'rr', 'hb', 'cycle', 'cycle_length', 'marriage_status', 'pregnant',
                'no_of_abortions', 'i_beta_hcg_1', 'i_beta_hcg_2', 'fsh', 'lh',
                'fsh_lh', 'hip', 'waist', 'waist_hip_ratio', 'tsh', 'amh', 'prl',
                'vit_d3', 'prg', 'rbs', 'weight_gain', 'hair_growth', 'skin_darkening',
                'hair_loss', 'pimples', 'fast_food', 'reg_exercise', 'bp_systolic',
                'bp_diastolic', 'follicle_no_l', 'follicle_no_r', 'avg_f_size_l',
                'avg_f_size_r', 'endometrium'
            ]
            
            importances = model.feature_importances_
            feature_importance = dict(zip(feature_names, importances.tolist()))
            top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5]
            feature_importance = dict(top_features)
        
        # Save to database
        import json
        db_assessment = Assessment(
            user_id=current_user.id,
            assessment_data=json.dumps(input_data.dict()),
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=confidence,
            recommendations=json.dumps(recommendations)
        )
        db.add(db_assessment)
        db.commit()
        db.refresh(db_assessment)
        
        return PCOSOutput(
            id=db_assessment.id,
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=confidence,
            recommendations=recommendations,
            feature_importance=feature_importance,
            created_at=db_assessment.created_at
        )
        
    except Exception as e:
        logger.error(f"Assessment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")

@app.get("/assessments", response_model=AssessmentHistory)
async def get_user_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """Get user's assessment history"""
    assessments = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    total_count = db.query(Assessment).filter(Assessment.user_id == current_user.id).count()
    
    import json
    assessment_list = []
    for assessment in assessments:
        assessment_list.append(PCOSOutput(
            id=assessment.id,
            risk_score=assessment.risk_score,
            risk_level=assessment.risk_level,
            confidence=assessment.confidence,
            recommendations=json.loads(assessment.recommendations),
            feature_importance={},  # Not stored in DB for space efficiency
            created_at=assessment.created_at
        ))
    
    return AssessmentHistory(assessments=assessment_list, total_count=total_count)

@app.get("/")
async def root():
    return {"message": "PCOS Prediction API with Authentication", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
