# 🔌 API Documentation

## Overview

Sentinel Sight provides a comprehensive API for sentiment analysis and emotion detection. This documentation covers all available endpoints, authentication methods, and integration examples.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [SDK Examples](#sdk-examples)
- [Webhooks](#webhooks)

## Authentication

### API Key Authentication

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.sentinelsight.ai/v1/analyze
```

### OAuth 2.0 (Enterprise)

```javascript
const response = await fetch('https://api.sentinelsight.ai/v1/analyze', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Base URL

**Production:** `https://api.sentinelsight.ai/v1`
**Staging:** `https://staging-api.sentinelsight.ai/v1`
**Development:** `http://localhost:3000/api/v1`

## Endpoints

### Sentiment Analysis

#### Analyze Single Message

```http
POST /analyze
```

**Request Body:**
```json
{
  "message": "I love this product! It works perfectly.",
  "customer_id": "CUST_001",
  "channel": "email",
  "metadata": {
    "timestamp": "2025-01-27T10:00:00Z",
    "language": "en"
  }
}
```

**Response:**
```json
{
  "id": "analysis_123456",
  "sentiment": {
    "emotion": "joy",
    "confidence": 0.94,
    "score": 0.85,
    "polarity": "positive"
  },
  "emotions": {
    "joy": 0.85,
    "anger": 0.02,
    "fear": 0.01,
    "sadness": 0.03,
    "surprise": 0.05,
    "disgust": 0.01,
    "love": 0.02,
    "optimism": 0.01,
    "neutral": 0.00
  },
  "metadata": {
    "processing_time": 1.2,
    "model_version": "gemini-2.0-flash",
    "timestamp": "2025-01-27T10:00:01Z"
  }
}
```

#### Bulk Analysis

```http
POST /analyze/bulk
```

**Request Body:**
```json
{
  "messages": [
    {
      "id": "msg_001",
      "message": "Great service!",
      "customer_id": "CUST_001",
      "channel": "chat"
    },
    {
      "id": "msg_002", 
      "message": "This is terrible.",
      "customer_id": "CUST_002",
      "channel": "email"
    }
  ],
  "options": {
    "include_emotions": true,
    "include_confidence": true
  }
}
```

**Response:**
```json
{
  "batch_id": "batch_789",
  "status": "completed",
  "results": [
    {
      "id": "msg_001",
      "sentiment": {
        "emotion": "joy",
        "confidence": 0.92,
        "score": 0.88,
        "polarity": "positive"
      }
    },
    {
      "id": "msg_002",
      "sentiment": {
        "emotion": "anger", 
        "confidence": 0.89,
        "score": -0.75,
        "polarity": "negative"
      }
    }
  ],
  "summary": {
    "total_messages": 2,
    "positive": 1,
    "negative": 1,
    "neutral": 0,
    "average_confidence": 0.905
  }
}
```

### Analytics

#### Get Sentiment Trends

```http
GET /analytics/trends?period=7d&customer_id=CUST_001
```

**Response:**
```json
{
  "period": "7d",
  "data": [
    {
      "date": "2025-01-21",
      "sentiment_score": 0.65,
      "message_count": 12,
      "emotions": {
        "joy": 0.45,
        "anger": 0.15,
        "neutral": 0.40
      }
    }
  ],
  "summary": {
    "average_sentiment": 0.72,
    "trend": "improving",
    "total_messages": 84
  }
}
```

#### Get Customer Insights

```http
GET /analytics/customers/{customer_id}
```

**Response:**
```json
{
  "customer_id": "CUST_001",
  "profile": {
    "total_messages": 156,
    "first_interaction": "2024-12-01T00:00:00Z",
    "last_interaction": "2025-01-27T09:30:00Z",
    "average_sentiment": 0.68,
    "risk_level": "low"
  },
  "trends": {
    "sentiment_trajectory": "stable",
    "recent_change": "+0.12",
    "dominant_emotions": ["joy", "neutral", "optimism"]
  },
  "channels": {
    "email": {"count": 89, "avg_sentiment": 0.71},
    "chat": {"count": 45, "avg_sentiment": 0.62},
    "phone": {"count": 22, "avg_sentiment": 0.75}
  }
}
```

## Data Models

### Sentiment Object

```typescript
interface Sentiment {
  emotion: 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'disgust' | 'love' | 'optimism' | 'neutral';
  confidence: number; // 0.0 to 1.0
  score: number; // -1.0 to 1.0
  polarity: 'positive' | 'negative' | 'neutral';
}
```

### Message Object

```typescript
interface Message {
  id?: string;
  message: string;
  customer_id?: string;
  channel?: 'email' | 'chat' | 'phone' | 'social' | 'review';
  metadata?: {
    timestamp?: string;
    language?: string;
    [key: string]: any;
  };
}
```

### Analysis Result

```typescript
interface AnalysisResult {
  id: string;
  sentiment: Sentiment;
  emotions: Record<string, number>;
  metadata: {
    processing_time: number;
    model_version: string;
    timestamp: string;
  };
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The message field is required",
    "details": {
      "field": "message",
      "reason": "missing_required_field"
    }
  },
  "request_id": "req_123456789"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_REQUEST` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | AI service temporarily unavailable |

## Rate Limiting

### Limits by Plan

| Plan | Requests/Hour | Bulk Messages/Day | Concurrent Requests |
|------|---------------|-------------------|-------------------|
| **Free** | 100 | 1,000 | 2 |
| **Pro** | 1,000 | 10,000 | 5 |
| **Enterprise** | 10,000 | 100,000 | 20 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643723400
```

## SDK Examples

### JavaScript/Node.js

```javascript
import { SentinelSightAPI } from '@sentinelsight/sdk';

const client = new SentinelSightAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.sentinelsight.ai/v1'
});

// Analyze single message
const result = await client.analyze({
  message: "I love this product!",
  customer_id: "CUST_001",
  channel: "email"
});

console.log(result.sentiment.emotion); // "joy"
console.log(result.sentiment.confidence); // 0.94
```

### Python

```python
from sentinelsight import SentinelSightAPI

client = SentinelSightAPI(api_key='your-api-key')

# Analyze single message
result = client.analyze(
    message="I love this product!",
    customer_id="CUST_001",
    channel="email"
)

print(result.sentiment.emotion)  # "joy"
print(result.sentiment.confidence)  # 0.94
```

### cURL

```bash
curl -X POST https://api.sentinelsight.ai/v1/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I love this product!",
    "customer_id": "CUST_001",
    "channel": "email"
  }'
```

## Webhooks

### Setting Up Webhooks

```http
POST /webhooks
```

**Request:**
```json
{
  "url": "https://your-app.com/webhooks/sentiment",
  "events": ["analysis.completed", "batch.completed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "analysis.completed",
  "data": {
    "id": "analysis_123456",
    "customer_id": "CUST_001",
    "sentiment": {
      "emotion": "joy",
      "confidence": 0.94,
      "score": 0.85,
      "polarity": "positive"
    },
    "timestamp": "2025-01-27T10:00:01Z"
  },
  "webhook_id": "webhook_789"
}
```

### Webhook Verification

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

## Integration Examples

### Real-time Customer Support

```javascript
// Monitor customer messages in real-time
const analyzeCustomerMessage = async (message, customerId) => {
  const result = await client.analyze({
    message: message.text,
    customer_id: customerId,
    channel: message.channel,
    metadata: {
      timestamp: message.timestamp,
      agent_id: message.agent_id
    }
  });

  // Alert if negative sentiment detected
  if (result.sentiment.polarity === 'negative' && result.sentiment.confidence > 0.8) {
    await alertManager.escalate({
      customer_id: customerId,
      sentiment_score: result.sentiment.score,
      emotion: result.sentiment.emotion,
      message: message.text
    });
  }

  return result;
};
```

### Batch Processing Historical Data

```javascript
// Process historical customer feedback
const processHistoricalData = async (messages) => {
  const batches = chunkArray(messages, 100); // Process in batches of 100
  
  for (const batch of batches) {
    const result = await client.analyzeBulk({
      messages: batch.map(msg => ({
        id: msg.id,
        message: msg.text,
        customer_id: msg.customer_id,
        channel: msg.channel
      }))
    });
    
    // Store results in database
    await database.storeSentimentResults(result.results);
    
    // Wait between batches to respect rate limits
    await sleep(1000);
  }
};
```

## Best Practices

### 1. Error Handling

```javascript
try {
  const result = await client.analyze(message);
  return result;
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Implement exponential backoff
    await sleep(error.retryAfter * 1000);
    return client.analyze(message);
  }
  
  if (error.code === 'SERVICE_UNAVAILABLE') {
    // Fallback to local processing
    return localSentimentAnalysis(message);
  }
  
  throw error;
}
```

### 2. Caching Results

```javascript
const cache = new Map();

const analyzeWithCache = async (message) => {
  const cacheKey = crypto.createHash('md5').update(message).digest('hex');
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await client.analyze({ message });
  cache.set(cacheKey, result);
  
  return result;
};
```

### 3. Batch Optimization

```javascript
// Optimize batch sizes based on content length
const optimizeBatchSize = (messages) => {
  const avgLength = messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length;
  
  if (avgLength > 200) return 50;  // Longer messages, smaller batches
  if (avgLength > 100) return 75;  // Medium messages
  return 100;                      // Short messages, full batch
};
```

## Support

- **Documentation:** [https://docs.sentinelsight.ai](https://docs.sentinelsight.ai)
- **API Status:** [https://status.sentinelsight.ai](https://status.sentinelsight.ai)
- **Support Email:** api-support@sentinelsight.ai
- **Discord Community:** [https://discord.gg/sentinelsight](https://discord.gg/sentinelsight)

---

**Last Updated:** January 27, 2025
**API Version:** v1.0.0