# Bulk Analysis Feature

## Overview

The Bulk Analysis feature allows you to upload CSV files containing multiple customer messages for batch sentiment analysis. This is perfect for processing historical data, analyzing large datasets, or conducting comprehensive sentiment reviews.

## Features

- **CSV Upload**: Drag & drop or browse to upload CSV files
- **Real-time Processing**: Watch as each message is analyzed with live progress updates
- **Batch Limits**: Maximum 100 messages per batch to ensure optimal performance
- **Error Handling**: Individual message errors don't stop the entire batch
- **Progress Tracking**: Visual progress bar and status indicators for each message
- **Results Integration**: All results are automatically added to your sentiment history

## CSV Format Requirements

### Required Columns
- **message** (or **text** or **content**): The customer message to analyze

### Optional Columns
- **customer_id** (or **user_id**): Customer identifier for tracking
- **channel** (or **source** or **platform**): Communication channel (email, chat, phone, social, review)

### Example CSV Structure
```csv
message,customer_id,channel
"I love this product! It works perfectly.",CUST_001,email
"The service was terrible and disappointing.",CUST_002,chat
"Thank you for the quick response.",CUST_003,phone
```

## How to Use

1. **Access Bulk Analysis**: Click the "Bulk Analysis" button in the main dashboard
2. **Upload CSV**: Drag & drop your CSV file or click to browse
3. **Review Preview**: Check the parsed messages before processing
4. **Start Analysis**: Click "Start Bulk Analysis" to begin processing
5. **Monitor Progress**: Watch real-time progress and individual message status
6. **View Results**: All results are automatically added to your emotion feed

## Processing Status Indicators

- **🟡 Pending**: Message waiting to be processed
- **🔵 Processing**: Message currently being analyzed
- **🟢 Completed**: Message successfully analyzed
- **🔴 Error**: Message failed to analyze (with error details)

## Best Practices

### File Preparation
- Use UTF-8 encoding for special characters
- Enclose messages with commas or quotes in double quotes
- Keep messages under 500 characters for best results
- Remove empty rows and columns

### Batch Size
- Maximum 100 messages per batch
- For larger datasets, split into multiple files
- Consider processing during off-peak hours for better performance

### Data Quality
- Clean and preprocess messages for better accuracy
- Remove system-generated messages or automated responses
- Ensure customer IDs are consistent across your dataset

## Error Handling

### Common Issues
- **Empty CSV**: File contains no valid data
- **Missing Message Column**: No column with "message", "text", or "content"
- **File Too Large**: More than 100 messages in the batch
- **Invalid Format**: File is not a valid CSV

### Recovery
- Individual message failures don't stop the batch
- Error details are shown for each failed message
- Successfully processed messages are still saved
- You can retry failed messages individually

## Integration with Existing Features

### Sentiment History
- All bulk results are added to your persistent sentiment history
- Results appear in the live emotion feed
- Historical data is included in trend charts and analytics

### Export Functionality
- Bulk analysis results can be exported using the existing export feature
- Filter and export specific date ranges or emotions
- Choose between CSV and JSON export formats

### Analytics Impact
- Bulk data immediately affects dashboard statistics
- Trend charts update with historical sentiment patterns
- Negative sentiment alerts consider bulk data

## Performance Considerations

### Processing Speed
- Each message takes approximately 1-2 seconds to process
- 100 messages typically complete in 2-3 minutes
- Processing time depends on AI model availability and network speed

### Resource Usage
- Uses the same AI engines as individual analysis (HuggingFace + Gemini fallback)
- Minimal memory footprint during processing
- Results are stored in browser localStorage

### Rate Limiting
- Built-in delays prevent API overwhelming
- Automatic fallback between AI providers
- Graceful error handling for temporary failures

## Sample Data

Download our sample CSV file to test the bulk analysis feature:
- Contains 10 diverse customer messages
- Includes various emotions and channels
- Perfect for testing and learning the format

## Troubleshooting

### Upload Issues
- Ensure file is in CSV format (.csv extension)
- Check file size (should be under 1MB for 100 messages)
- Verify CSV structure matches requirements

### Processing Failures
- Check internet connection
- Verify AI model configuration in Settings
- Try smaller batch sizes if experiencing timeouts

### Results Not Appearing
- Check if messages were successfully processed (green status)
- Refresh the emotion feed
- Verify localStorage isn't full (clear old data if needed)

## Future Enhancements

- Support for additional file formats (Excel, JSON)
- Larger batch sizes with background processing
- Scheduled bulk analysis
- Advanced filtering and preprocessing options
- Bulk analysis templates and presets