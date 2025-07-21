import { motion } from 'framer-motion';
import { 
  Cookie, 
  Settings, 
  BarChart3, 
  Shield, 
  Globe, 
  Eye,
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
  const navigate = useNavigate();

  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: Shield,
      status: "Required",
      statusColor: "bg-green-500",
      description: "These cookies are necessary for the website to function properly and cannot be disabled.",
      cookies: [
        {
          name: "session_id",
          purpose: "Maintains your session state and preferences",
          duration: "Session",
          type: "First-party"
        },
        {
          name: "theme_preference",
          purpose: "Remembers your dark/light theme choice",
          duration: "1 year",
          type: "First-party"
        },
        {
          name: "consent_status",
          purpose: "Stores your cookie consent preferences",
          duration: "1 year",
          type: "First-party"
        }
      ]
    },
    {
      title: "Analytics Cookies",
      icon: BarChart3,
      status: "Optional",
      statusColor: "bg-blue-500",
      description: "These cookies help us understand how visitors interact with our website by collecting anonymous information.",
      cookies: [
        {
          name: "analytics_id",
          purpose: "Tracks user interactions for service improvement",
          duration: "2 years",
          type: "Third-party"
        },
        {
          name: "page_views",
          purpose: "Counts page visits and popular features",
          duration: "30 days",
          type: "First-party"
        },
        {
          name: "performance_metrics",
          purpose: "Monitors application performance and errors",
          duration: "90 days",
          type: "First-party"
        }
      ]
    },
    {
      title: "Functional Cookies",
      icon: Settings,
      status: "Optional",
      statusColor: "bg-purple-500",
      description: "These cookies enable enhanced functionality and personalization features.",
      cookies: [
        {
          name: "user_preferences",
          purpose: "Stores your application settings and preferences",
          duration: "1 year",
          type: "First-party"
        },
        {
          name: "analysis_history",
          purpose: "Saves your sentiment analysis history locally",
          duration: "6 months",
          type: "First-party"
        },
        {
          name: "export_settings",
          purpose: "Remembers your data export preferences",
          duration: "90 days",
          type: "First-party"
        }
      ]
    },
    {
      title: "Third-Party Cookies",
      icon: Globe,
      status: "Optional",
      statusColor: "bg-orange-500",
      description: "These cookies are set by third-party services we use to enhance our platform.",
      cookies: [
        {
          name: "gemini_api_session",
          purpose: "Manages Google Gemini AI service authentication",
          duration: "Session",
          type: "Third-party"
        },
        {
          name: "huggingface_cache",
          purpose: "Caches HuggingFace model data for faster loading",
          duration: "7 days",
          type: "Third-party"
        }
      ]
    }
  ];

  const sections = [
    {
      title: "What Are Cookies",
      icon: Info,
      content: "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our service."
    },
    {
      title: "How We Use Cookies",
      icon: Eye,
      content: "We use cookies to enhance your experience, analyze website traffic, personalize content, and provide social media features. Cookies also help us understand which features are most popular and how we can improve our service."
    },
    {
      title: "Managing Your Preferences",
      icon: Settings,
      content: "You can control and manage cookies in various ways. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. However, this may affect the functionality of our website."
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <Cookie className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn how Sentinel Sight uses cookies to enhance your experience and protect your privacy.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Version 1.0</span>
            </div>
          </div>
        </motion.div>

        {/* Cookie Consent Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <Cookie className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Cookie Notice:</strong> We use cookies to improve your experience on our website. 
              By continuing to use Sentinel Sight, you consent to our use of cookies as described in this policy.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <p className="text-foreground leading-relaxed">
                This Cookie Policy explains how Sentinel Sight uses cookies and similar technologies when you visit our website. 
                It explains what these technologies are, why we use them, and your rights to control our use of them. 
                This policy should be read alongside our Privacy Policy and Terms of Service.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cookie Information Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Cookie Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Types of Cookies We Use</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We use different types of cookies for various purposes. Here's a detailed breakdown of each category:
            </p>
          </div>
        </motion.div>

        <div className="space-y-8">
          {cookieTypes.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {category.title}
                      </div>
                      <Badge className={`${category.statusColor} text-white`}>
                        {category.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Specific Cookies:</h4>
                      {category.cookies.map((cookie, cookieIndex) => (
                        <div key={cookieIndex} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-foreground">{cookie.name}</h5>
                            <Badge variant="outline">{cookie.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{cookie.purpose}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span><strong>Duration:</strong> {cookie.duration}</span>
                            <span><strong>Type:</strong> {cookie.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Cookie Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-purple-600" />
                Managing Your Cookie Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">
                You have several options to manage cookies on our website:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Browser Settings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Configure your browser to block or delete cookies. Note that this may affect website functionality.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    Application Settings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use our in-app settings to control functional cookies and data storage preferences.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-500" />
                    Opt-Out Tools
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use third-party opt-out tools to manage tracking cookies from analytics and advertising services.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Privacy Mode
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Use our privacy-first local analysis mode to minimize data collection and cookie usage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Third-Party Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-600" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                We use the following third-party services that may set their own cookies:
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Google Gemini AI</h4>
                    <p className="text-sm text-muted-foreground">AI-powered sentiment analysis service</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      Privacy Policy
                      <ArrowLeft className="h-3 w-3 rotate-180" />
                    </a>
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">HuggingFace</h4>
                    <p className="text-sm text-muted-foreground">Machine learning model hosting and inference</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <a href="https://huggingface.co/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                      Privacy Policy
                      <ArrowLeft className="h-3 w-3 rotate-180" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                Questions About Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> cookies@sentinelsight.com</p>
                <p><strong>Address:</strong> Sentinel Sight Privacy Team</p>
                <p className="text-muted-foreground">
                  We will respond to your cookie-related inquiries within 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            This Cookie Policy is effective as of {new Date().toLocaleDateString()} and will be updated as necessary to reflect changes in our cookie practices.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiePolicy;