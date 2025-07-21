import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  FileText,
  ArrowLeft,
  Mail,
  Calendar,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          text: "We may collect personal information such as your name, email address, and contact details when you voluntarily provide them through our contact forms or user registration."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our service, including IP addresses, browser type, device information, and usage patterns."
        },
        {
          subtitle: "Sentiment Analysis Data",
          text: "Text data you submit for sentiment analysis is processed locally in your browser when possible. When using cloud AI services, data may be temporarily processed by third-party AI providers."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: UserCheck,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our sentiment analysis services, including processing your text data and delivering analysis results."
        },
        {
          subtitle: "Communication",
          text: "We may use your contact information to respond to your inquiries, provide customer support, and send important service updates."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to improve our service performance, user experience, and develop new features."
        }
      ]
    },
    {
      title: "Data Protection & Security",
      icon: Lock,
      content: [
        {
          subtitle: "Privacy-First Design",
          text: "Our service is designed with privacy in mind. When possible, sentiment analysis is performed locally in your browser without sending data to external servers."
        },
        {
          subtitle: "Data Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols. We implement appropriate technical and organizational measures to protect your data."
        },
        {
          subtitle: "Data Retention",
          text: "We retain your data only as long as necessary to provide our services. Analysis results are stored locally in your browser and can be cleared at any time."
        }
      ]
    },
    {
      title: "Third-Party Services",
      icon: Globe,
      content: [
        {
          subtitle: "AI Service Providers",
          text: "When using cloud-based AI analysis, your text data may be processed by Google Gemini or HuggingFace services. These services have their own privacy policies."
        },
        {
          subtitle: "Analytics Services",
          text: "We may use analytics services to understand how our service is used. These services may collect anonymized usage data."
        },
        {
          subtitle: "No Data Selling",
          text: "We do not sell, rent, or share your personal information with third parties for their marketing purposes."
        }
      ]
    },
    {
      title: "Your Rights",
      icon: Eye,
      content: [
        {
          subtitle: "Access and Control",
          text: "You have the right to access, update, or delete your personal information. You can clear your local analysis history at any time through the application settings."
        },
        {
          subtitle: "Data Portability",
          text: "You can export your sentiment analysis data in various formats (JSON, CSV, PDF) through our export functionality."
        },
        {
          subtitle: "Opt-Out Rights",
          text: "You can opt out of data collection by using the local-only analysis mode or by discontinuing use of our service."
        }
      ]
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
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how Sentinel Sight collects, uses, and protects your information.
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

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <p className="text-foreground leading-relaxed">
                At Sentinel Sight, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                sentiment analysis service. By using our service, you agree to the collection and use of information in accordance 
                with this policy.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
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
                  <CardContent className="p-6 space-y-6">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <h4 className="font-semibold text-foreground">{item.subtitle}</h4>
                        <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                        {itemIndex < section.content.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@sentinelsight.com</p>
                <p><strong>Address:</strong> Sentinel Sight Privacy Team</p>
                <p className="text-muted-foreground">
                  We will respond to your privacy-related inquiries within 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            This Privacy Policy is effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;