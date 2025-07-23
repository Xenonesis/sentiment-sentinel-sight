import { useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, X, Download, Loader2, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';

interface BulkAnalysisModalProps {
  onAnalyze: (message: string, customerId?: string, channel?: string) => Promise<SentimentResult>;
  onBulkComplete: (results: SentimentResult[]) => void;
  isAnalyzing: boolean;
}

interface CSVRow {
  message: string;
  customerId?: string;
  channel?: string;
  rowIndex: number;
}

interface ProcessingResult {
  row: CSVRow;
  result?: SentimentResult;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export const BulkAnalysisModal = ({ onAnalyze, onBulkComplete, isAnalyzing }: BulkAnalysisModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCsv = useCallback((csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) throw new Error('CSV file is empty');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const messageIndex = headers.findIndex(h => h.includes('message') || h.includes('text') || h.includes('content'));
    const customerIndex = headers.findIndex(h => h.includes('customer') || h.includes('user') || h.includes('id'));
    const channelIndex = headers.findIndex(h => h.includes('channel') || h.includes('source') || h.includes('platform'));

    if (messageIndex === -1) {
      throw new Error('CSV must contain a column with "message", "text", or "content" in the header');
    }

    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const message = values[messageIndex]?.trim();
      
      if (message && message.length > 0) {
        rows.push({
          message,
          customerId: customerIndex >= 0 ? values[customerIndex] : undefined,
          channel: channelIndex >= 0 ? values[channelIndex] : undefined,
          rowIndex: i
        });
      }
    }

    if (rows.length === 0) {
      throw new Error('No valid messages found in CSV file');
    }

    return rows;
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      
      if (rows.length > 100) {
        throw new Error('Maximum 100 messages allowed per batch. Please split your file into smaller chunks.');
      }

      setCsvData(rows);
      setProcessingResults(rows.map(row => ({ row, status: 'pending' })));
      
      toast({
        title: "CSV Loaded Successfully",
        description: `Found ${rows.length} messages ready for analysis.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse CSV file';
      toast({
        title: "CSV Upload Error",
        description: message,
        variant: "destructive",
      });
    }
  }, [parseCsv, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileUpload(csvFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  }, [handleFileUpload, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const processBulkAnalysis = useCallback(async () => {
    if (csvData.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    
    const results: SentimentResult[] = [];
    const updatedResults = [...processingResults];

    try {
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        // Update status to processing
        updatedResults[i] = { ...updatedResults[i], status: 'processing' };
        setProcessingResults([...updatedResults]);

        try {
          const result = await onAnalyze(row.message, row.customerId, row.channel);
          results.push(result);
          
          // Update status to completed
          updatedResults[i] = { 
            ...updatedResults[i], 
            status: 'completed', 
            result 
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
          updatedResults[i] = { 
            ...updatedResults[i], 
            status: 'error', 
            error: errorMessage 
          };
        }

        setProcessingResults([...updatedResults]);
        setProgress(((i + 1) / csvData.length) * 100);

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (results.length > 0) {
        onBulkComplete(results);
        toast({
          title: "Bulk Analysis Complete",
          description: `Successfully analyzed ${results.length} out of ${csvData.length} messages.`,
        });
      }
    } catch (error) {
      logger.error('Bulk analysis error:', error);
      toast({
        title: "Bulk Analysis Error",
        description: "An error occurred during bulk analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [csvData, processingResults, onAnalyze, onBulkComplete, toast]);

  const downloadSampleCsv = useCallback(() => {
    // Use the public sample CSV file
    const link = document.createElement('a');
    link.href = '/sample-bulk-analysis.csv';
    link.download = 'sample-bulk-analysis.csv';
    link.click();
  }, []);

  const resetModal = useCallback(() => {
    setCsvData([]);
    setProcessingResults([]);
    setProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    resetModal();
  }, [resetModal]);

  const handleForceClose = useCallback(() => {
    if (isProcessing) {
      toast({
        title: "Processing Cancelled",
        description: "Bulk analysis has been cancelled.",
        variant: "destructive",
      });
    }
    setIsOpen(false);
    resetModal();
  }, [isProcessing, resetModal, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <Database className="mr-2 h-4 w-4" />
          Bulk Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Bulk Sentiment Analysis
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={isProcessing ? handleForceClose : handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          {csvData.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload CSV File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
                  <p className="text-muted-foreground mb-4">
                    Or click to browse and select a file
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Select CSV File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>CSV Format Requirements:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Must contain a column with "message", "text", or "content" in the header</li>
                      <li>Optional: "customer_id" or "user_id" column for customer tracking</li>
                      <li>Optional: "channel" or "source" column for channel information</li>
                      <li>Maximum 100 messages per batch</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <Button 
                    variant="ghost" 
                    onClick={downloadSampleCsv}
                    className="text-primary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview and Processing Section */}
          {csvData.length > 0 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Ready to Analyze ({csvData.length} messages)
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetModal}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isProcessing && processingResults.every(r => r.status === 'pending') && (
                    <Button 
                      onClick={processBulkAnalysis}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-sentiment hover:shadow-glow transition-all duration-300"
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Start Bulk Analysis
                    </Button>
                  )}

                  {isProcessing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Processing messages...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleForceClose}
                        className="w-full"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Processing
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {processingResults.map((result, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 border rounded-lg bg-background/50"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Row {result.row.rowIndex}</Badge>
                                {result.status === 'pending' && (
                                  <Badge variant="secondary">Pending</Badge>
                                )}
                                {result.status === 'processing' && (
                                  <Badge variant="secondary" className="bg-blue-500">
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    Processing
                                  </Badge>
                                )}
                                {result.status === 'completed' && (
                                  <Badge variant="secondary" className="bg-green-500">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Completed
                                  </Badge>
                                )}
                                {result.status === 'error' && (
                                  <Badge variant="destructive">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Error
                                  </Badge>
                                )}
                              </div>
                              {result.result && (
                                <Badge 
                                  variant="secondary"
                                  className={`bg-sentiment-${result.result.emotion.toLowerCase()} text-white`}
                                >
                                  {result.result.emotion.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm mb-2 line-clamp-2">
                              "{result.row.message}"
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {result.row.customerId && (
                                <span>Customer: {result.row.customerId}</span>
                              )}
                              {result.row.channel && (
                                <span>Channel: {result.row.channel}</span>
                              )}
                              {result.result && (
                                <span>Confidence: {(result.result.confidence * 100).toFixed(1)}%</span>
                              )}
                            </div>
                            
                            {result.error && (
                              <Alert className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                  {result.error}
                                </AlertDescription>
                              </Alert>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};