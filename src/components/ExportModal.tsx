import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Database, Calendar, Filter, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useDataExport, ExportOptions } from '@/hooks/useDataExport';
import { SentimentResult } from '@/hooks/useSentimentAnalysis';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentiments: SentimentResult[];
  getEmotionColor: (emotion: string) => string;
}

export const ExportModal = ({ isOpen, onClose, sentiments, getEmotionColor }: ExportModalProps) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const { exportData, getExportPreview } = useDataExport();

  // Get unique emotions and channels from sentiments
  const availableEmotions = [...new Set(sentiments.map(s => s.emotion))];
  const availableChannels = [...new Set(sentiments.map(s => s.channel).filter(Boolean))];

  const buildExportOptions = (): ExportOptions => {
    const options: ExportOptions = { format };

    if (dateRange.start && dateRange.end) {
      options.dateRange = {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      };
    }

    if (selectedEmotions.length > 0) {
      options.emotions = selectedEmotions;
    }

    if (selectedChannels.length > 0) {
      options.channels = selectedChannels;
    }

    if (minConfidence > 0) {
      options.minConfidence = minConfidence / 100;
    }

    return options;
  };

  const preview = getExportPreview(sentiments, buildExportOptions());

  const handleExport = async () => {
    if (sentiments.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "Please analyze some messages first before exporting."
      });
      return;
    }

    setIsExporting(true);
    try {
      const options = buildExportOptions();
      const result = exportData(sentiments, options);

      toast({
        title: "Export Successful",
        description: `Exported ${result.exportedCount} of ${result.totalCount} records as ${format.toUpperCase()}`
      });

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Sentiment Data
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export Format
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={format} onValueChange={(value: 'csv' | 'json') => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                    <SelectItem value="json">JSON (Developer Friendly)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      placeholder="Start date"
                    />
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      placeholder="End date"
                    />
                  </div>
                </div>

                {/* Emotions Filter */}
                <div className="space-y-2">
                  <Label>Emotions (Leave empty for all)</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableEmotions.map(emotion => (
                      <Badge
                        key={emotion}
                        variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedEmotions.includes(emotion) 
                            ? `bg-${getEmotionColor(emotion)} text-white` 
                            : ''
                        }`}
                        onClick={() => toggleEmotion(emotion)}
                      >
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Channels Filter */}
                {availableChannels.length > 0 && (
                  <div className="space-y-2">
                    <Label>Channels (Leave empty for all)</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableChannels.map(channel => (
                        <Badge
                          key={channel}
                          variant={selectedChannels.includes(channel) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleChannel(channel)}
                        >
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence Filter */}
                <div className="space-y-2">
                  <Label>Minimum Confidence (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={minConfidence}
                    onChange={(e) => setMinConfidence(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Export Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Records:</span>
                    <div className="font-semibold">{preview.totalRecords}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Will Export:</span>
                    <div className="font-semibold text-primary">{preview.filteredRecords}</div>
                  </div>
                </div>

                {preview.dateRange && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Date Range:</span>
                    <div className="font-medium">
                      {preview.dateRange.earliest.toLocaleDateString()} - {preview.dateRange.latest.toLocaleDateString()}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sample Records:</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {preview.preview.map((sentiment, index) => (
                      <div key={index} className="p-2 bg-muted/50 rounded text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="secondary" 
                            className={`bg-${getEmotionColor(sentiment.emotion)} text-white text-xs`}
                          >
                            {sentiment.emotion}
                          </Badge>
                          <span className="text-muted-foreground">
                            {(sentiment.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="line-clamp-2">"{sentiment.message}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                disabled={isExporting || preview.filteredRecords === 0}
                className="flex-1 bg-gradient-sentiment hover:shadow-glow"
              >
                {isExporting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Download className="h-4 w-4" />
                    </motion.div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export {format.toUpperCase()}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};