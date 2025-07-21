# Customer Sentiment Watchdog 🧠

A comprehensive AI-powered customer sentiment analysis tool that monitors and analyzes customer communications in real-time.

## ✨ Features

- **Real-time Sentiment Analysis**: Uses HuggingFace's emotion detection model to analyze customer messages
- **Live Emotion Feed**: Real-time dashboard showing all analyzed messages with confidence scores
- **Alert System**: Automatically alerts when negative sentiment exceeds 30% threshold
- **Multi-channel Support**: Track sentiment across email, chat, phone, social media, and reviews
- **Beautiful UI**: Modern interface built with shadcn/ui, Tailwind CSS, and Framer Motion
- **Client-side AI**: Runs emotion detection directly in the browser for instant results

## 🛠️ Tech Stack

### Frontend (Current Implementation)
- **Vite + React**: Fast, modern development
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **Framer Motion**: Smooth animations
- **HuggingFace Transformers**: Client-side AI model
- **Recharts**: Data visualization

### Backend (Reference Implementation)
- **FastAPI**: High-performance Python API
- **Supabase**: PostgreSQL database with real-time capabilities
- **HuggingFace Transformers**: Server-side emotion detection
- **PyTorch**: ML model inference

## 🚀 Getting Started

### Frontend Setup (Current)

1. The app is already running in Lovable! 
2. Click "Analyze Sentiment" to test with example messages
3. The AI model will load automatically on first use

### For Supabase Integration

To enable database storage and backend functionality:

1. **Connect Supabase**: Click the green Supabase button in Lovable's interface
2. **Run Database Schema**: Execute the SQL in `backend-reference/supabase-schema.sql`
3. **Set up RLS policies**: Configure Row Level Security as needed

### Local Backend Setup (Optional)

```bash
# Clone and setup backend
cd backend-reference

# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# Run the FastAPI server
python main.py
```

## 📊 Emotion Detection

The system detects 8 different emotions:

- **Positive**: Joy, Love, Optimism, Surprise
- **Negative**: Anger, Fear, Sadness, Disgust

### Model Details
- **Model**: `j-hartmann/emotion-english-distilroberta-base`
- **Accuracy**: High performance on English text
- **Processing**: Client-side with WebGPU acceleration
- **Fallback**: WASM for broader browser compatibility

## 🎯 Key Features Explained

### Real-time Analysis
- Instant emotion detection as you type
- Confidence scores for each prediction
- Color-coded emotion badges

### Alert System
- Monitors last 10 messages for negative sentiment
- Triggers visual alert at 30% negative threshold
- Toast notifications for high-confidence detections

### Analytics Dashboard
- Total message count
- Negative sentiment percentage
- Top emotion distribution
- Historical message feed

## 🔧 API Endpoints (Backend Reference)

```bash
POST /analyze
# Analyze message sentiment
{
  "message": "I love this product!",
  "customer_id": "CUST_001",
  "channel": "email"
}

GET /sentiments?limit=100
# Get recent sentiment analysis results

GET /analytics
# Get sentiment statistics and trends

GET /health
# Health check endpoint
```

## 📈 Database Schema

The Supabase database includes:

- `sentiment_analysis` table for storing all analyses
- Indexes for performance optimization
- Analytics views for reporting
- RLS policies for security
- Helper functions for trend analysis

## 🎨 Design System

The app uses a custom design system with:

- **Color Palette**: Emotion-specific colors for each sentiment
- **Dark Theme**: Professional dark UI optimized for monitoring
- **Gradients**: Beautiful gradient backgrounds and effects
- **Animations**: Smooth Framer Motion transitions
- **Responsive**: Mobile-first design approach

## 🔐 Security Features

- Row Level Security (RLS) on Supabase
- Input validation and sanitization
- CORS protection
- Error handling and logging

## 📝 Usage Examples

### Analyze Customer Feedback
```
Input: "The customer support was terrible and I'm very frustrated with this experience!"
Output: Emotion: ANGER, Confidence: 94.2%
```

### Monitor Social Media
```
Input: "I absolutely love your new product! Amazing work!"
Output: Emotion: JOY, Confidence: 96.8%
```

### Track Support Tickets
```
Input: "I'm confused about how to use this feature. Can someone help?"
Output: Emotion: FEAR, Confidence: 67.3%
```

## 🚀 Deployment Options

### Frontend
- **Lovable**: Already deployed and running
- **Vercel**: Easy deployment for React apps
- **Netlify**: Static site hosting

### Backend
- **Render**: Free tier available for FastAPI
- **Railway**: Simple Python deployment
- **Google Cloud Run**: Serverless container hosting

## 🎯 Future Enhancements

- [ ] Sentiment trend charts
- [ ] Customer sentiment profiles
- [ ] Integration with popular CRM systems
- [ ] Multi-language support
- [ ] Sentiment-based auto-routing
- [ ] Advanced analytics and reporting
- [ ] Webhook notifications
- [ ] Bulk message processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

- Check the troubleshooting section below
- Review the API documentation
- Test with example messages first

---

**Built with ❤️ using Lovable, React, and HuggingFace Transformers**