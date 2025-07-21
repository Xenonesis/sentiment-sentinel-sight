-- Supabase database schema for Customer Sentiment Watchdog
-- Run these SQL commands in your Supabase SQL editor

-- Create the sentiment_analysis table
CREATE TABLE sentiment_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    emotion TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    customer_id TEXT,
    channel TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_negative BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sentiment_timestamp ON sentiment_analysis(timestamp DESC);
CREATE INDEX idx_sentiment_emotion ON sentiment_analysis(emotion);
CREATE INDEX idx_sentiment_customer ON sentiment_analysis(customer_id);
CREATE INDEX idx_sentiment_channel ON sentiment_analysis(channel);
CREATE INDEX idx_sentiment_negative ON sentiment_analysis(is_negative);

-- Enable Row Level Security (RLS)
ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
-- Adjust this policy based on your authentication requirements
CREATE POLICY "Allow all operations for authenticated users" ON sentiment_analysis
    FOR ALL USING (true);

-- Alternatively, create more restrictive policies:
-- CREATE POLICY "Allow read access" ON sentiment_analysis
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow insert access" ON sentiment_analysis
--     FOR INSERT WITH CHECK (true);

-- Create a view for analytics
CREATE OR REPLACE VIEW sentiment_analytics AS
SELECT 
    emotion,
    COUNT(*) as count,
    AVG(confidence) as avg_confidence,
    COUNT(*) FILTER (WHERE is_negative = true) as negative_count,
    COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '24 hours') as last_24h_count
FROM sentiment_analysis
GROUP BY emotion;

-- Grant access to the view
GRANT SELECT ON sentiment_analytics TO anon, authenticated;

-- Function to get recent sentiment trends
CREATE OR REPLACE FUNCTION get_sentiment_trend(hours_back INTEGER DEFAULT 24)
RETURNS TABLE (
    hour_bucket TIMESTAMP,
    positive_count BIGINT,
    negative_count BIGINT,
    total_count BIGINT
) 
LANGUAGE sql
AS $$
    SELECT 
        date_trunc('hour', timestamp) as hour_bucket,
        COUNT(*) FILTER (WHERE is_negative = false) as positive_count,
        COUNT(*) FILTER (WHERE is_negative = true) as negative_count,
        COUNT(*) as total_count
    FROM sentiment_analysis 
    WHERE timestamp >= NOW() - (hours_back || ' hours')::INTERVAL
    GROUP BY date_trunc('hour', timestamp)
    ORDER BY hour_bucket;
$$;