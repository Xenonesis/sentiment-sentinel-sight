# FastAPI Backend Reference Code
# This file is for reference only - Lovable cannot run Python backends directly
# You can use this code in your local development environment

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
from supabase import create_client, Client
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch

# Initialize FastAPI app
app = FastAPI(title="Customer Sentiment Watchdog API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load emotion detection model
print("Loading emotion detection model...")
model_name = "j-hartmann/emotion-english-distilroberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
emotion_pipeline = pipeline(
    "text-classification",
    model=model,
    tokenizer=tokenizer,
    device=0 if torch.cuda.is_available() else -1
)
print("Model loaded successfully!")

# Pydantic models
class MessageRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None
    channel: Optional[str] = None

class SentimentResponse(BaseModel):
    emotion: str
    confidence: float
    timestamp: datetime
    message: str
    customer_id: Optional[str] = None
    channel: Optional[str] = None
    id: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Customer Sentiment Watchdog API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: MessageRequest):
    """
    Analyze the sentiment/emotion of a customer message
    """
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Analyze emotion using the model
        results = emotion_pipeline(request.message)
        
        # Get the emotion with highest confidence
        top_emotion = max(results, key=lambda x: x['score'])
        
        # Prepare data for database
        sentiment_data = {
            "message": request.message,
            "emotion": top_emotion['label'],
            "confidence": top_emotion['score'],
            "customer_id": request.customer_id,
            "channel": request.channel,
            "timestamp": datetime.utcnow().isoformat(),
            "is_negative": top_emotion['label'].lower() in ['anger', 'fear', 'sadness', 'disgust']
        }
        
        # Insert into Supabase
        result = supabase.table("sentiment_analysis").insert(sentiment_data).execute()
        
        if result.data:
            inserted_record = result.data[0]
            return SentimentResponse(
                id=inserted_record.get("id"),
                emotion=inserted_record["emotion"],
                confidence=inserted_record["confidence"],
                timestamp=datetime.fromisoformat(inserted_record["timestamp"].replace('Z', '+00:00')),
                message=inserted_record["message"],
                customer_id=inserted_record.get("customer_id"),
                channel=inserted_record.get("channel")
            )
        else:
            raise HTTPException(status_code=500, detail="Failed to save to database")
            
    except Exception as e:
        print(f"Error analyzing sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/sentiments")
async def get_sentiments(limit: int = 100):
    """
    Get recent sentiment analysis results
    """
    try:
        result = supabase.table("sentiment_analysis")\
            .select("*")\
            .order("timestamp", desc=True)\
            .limit(limit)\
            .execute()
        
        return {"sentiments": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sentiments: {str(e)}")

@app.get("/analytics")
async def get_analytics():
    """
    Get sentiment analytics and statistics
    """
    try:
        # Get total count
        total_result = supabase.table("sentiment_analysis").select("id", count="exact").execute()
        total_count = total_result.count
        
        # Get emotion distribution
        emotions_result = supabase.table("sentiment_analysis")\
            .select("emotion")\
            .execute()
        
        emotion_counts = {}
        negative_count = 0
        
        for record in emotions_result.data:
            emotion = record["emotion"]
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            if emotion.lower() in ['anger', 'fear', 'sadness', 'disgust']:
                negative_count += 1
        
        negative_percentage = (negative_count / total_count * 100) if total_count > 0 else 0
        
        return {
            "total_messages": total_count,
            "negative_percentage": round(negative_percentage, 2),
            "emotion_distribution": emotion_counts,
            "alert_threshold_reached": negative_percentage >= 30
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)