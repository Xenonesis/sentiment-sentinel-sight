import { motion } from 'framer-motion';
import { 
  FileText, 
  Scale, 
  AlertTriangle, 
  Users, 
  Shield, 
  Gavel,
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using Sentinel Sight, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms."
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 18 years old to use this service. By using Sentinel Sight, you represent and warrant that you meet this age requirement."
        }
      ]
    },
    {
      title: "Service Description",
      icon: FileText,
      content: [
        {
          subtitle: "AI-Powered Sentiment Analysis",
          text: "Sentinel Sight provides artificial intelligence-powered sentiment analysis services for text data. Our service analyzes emotional content and provides insights into customer sentiment."
        },
        {
          subtitle: "Service Availability",
          text: "We strive to maintain high service availability but do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues."
        },
        {
          subtitle: "Accuracy Disclaimer",
          text: "While we use advanced AI models, sentiment analysis results are not guaranteed to be 100% accurate. Results should be used as guidance and not as definitive assessments."
        }
      ]
    },
    {
      title: "User Responsibilities",
      icon: Users,
      content: [
        {
          subtitle: "Appropriate Use",
          text: "You agree to use the service only for lawful purposes and in accordance with these terms. You must not use the service to analyze content that violates applicable laws or regulations."
        },
        {
          subtitle: "Data Quality",
          text: "You are responsible for ensuring that any data you submit for analysis is appropriate and does not contain harmful, illegal, or offensive content."
        },
        {
          subtitle: "Account Security",
          text: "If you create an account, you are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
        }
      ]
    },
    {
      title: "Prohibited Uses",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Illegal Activities",
          text: "You may not use our service for any illegal or unauthorized purpose, including but not limited to violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances."
        },
        {
          subtitle: "Harmful Content",
          text: "You may not submit content that is defamatory, obscene, threatening, harassing, or otherwise objectionable, or that infringes upon the rights of any third party."
        },
        {
          subtitle: "System Abuse",
          text: "You may not attempt to interfere with, compromise the security of, or decipher any transmissions to or from the servers running the service."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: Shield,
      content: [
        {
          subtitle: "Service Ownership",
          text: "The service and its original content, features, and functionality are and will remain the exclusive property of Sentinel Sight and its licensors."
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of any content you submit to the service. By submitting content, you grant us a limited license to process and analyze it for the purpose of providing our services."
        },
        {
          subtitle: "Trademark Rights",
          text: "Sentinel Sight and related marks are trademarks of our company. You may not use these trademarks without our prior written consent."
        }
      ]
    },
    {
      title: "Limitation of Liability",
      icon: Scale,
      content: [
        {
          subtitle: "Service Disclaimer",
          text: "The service is provided on an 'as is' and 'as available' basis. We make no representations or warranties of any kind, express or implied, regarding the service."
        },
        {
          subtitle: "Damages Limitation",
          text: "In no event shall Sentinel Sight be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
        },
        {
          subtitle: "Maximum Liability",
          text: "Our total liability to you for all damages, losses, and causes of action shall not exceed the amount paid by you, if any, for accessing the service."
        }
      ]
    },
    {
      title: "Termination",
      icon: Gavel,
      content: [
        {
          subtitle: "Termination Rights",
          text: "We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms."
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, your right to use the service will cease immediately. All provisions of the terms which by their nature should survive termination shall survive."
        },
        {
          subtitle: "Data Retention",
          text: "Following termination, we may retain certain information as required by law or for legitimate business purposes, in accordance with our Privacy Policy."
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
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using Sentinel Sight. These terms govern your use of our sentiment analysis service.
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

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> By using Sentinel Sight, you agree to these terms of service. 
              Please read them carefully as they contain important information about your rights and obligations.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <p className="text-foreground leading-relaxed">
                Welcome to Sentinel Sight. These Terms of Service ("Terms") govern your use of our AI-powered sentiment 
                analysis platform. These Terms constitute a legally binding agreement between you and Sentinel Sight. 
                Please read these Terms carefully before using our service.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
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

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Gavel className="h-5 w-5 text-slate-600" />
                Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Sentinel Sight operates, 
                without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the 
                service shall be resolved through binding arbitration in accordance with the rules of the applicable arbitration association.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> legal@sentinelsight.com</p>
                <p><strong>Address:</strong> Sentinel Sight Legal Department</p>
                <p className="text-muted-foreground">
                  We will respond to your legal inquiries within 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            These Terms of Service are effective as of {new Date().toLocaleDateString()} and will remain in effect except with respect to any changes in its provisions in the future.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;