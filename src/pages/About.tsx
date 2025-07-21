import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  Palette, 
  BarChart3, 
  Globe, 
  Code, 
  Heart,
  Star,
  Users,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Github,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const techStack = [
    {
      category: "Frontend Framework",
      items: [
        { name: "React 18.3.1", description: "Modern React with hooks and concurrent features", icon: "⚛️" },
        { name: "TypeScript 5.5.3", description: "Type-safe development with latest features", icon: "🔷" },
        { name: "Vite 5.4.1", description: "Lightning-fast build tool and dev server", icon: "⚡" }
      ]
    },
    {
      category: "UI & Styling",
      items: [
        { name: "Tailwind CSS 3.4.11", description: "Utility-first CSS framework", icon: "🎨" },
        { name: "shadcn/ui", description: "Beautiful, accessible component library", icon: "🧩" },
        { name: "Framer Motion 12.23.6", description: "Smooth animations and transitions", icon: "✨" },
        { name: "Lucide React", description: "Beautiful SVG icon library", icon: "🎯" }
      ]
    },
    {
      category: "AI & Machine Learning",
      items: [
        { name: "HuggingFace Transformers 3.6.3", description: "Client-side emotion detection", icon: "🤖" },
        { name: "Google Gemini 2.0 Flash", description: "Advanced cloud-based AI analysis", icon: "🧠" },
        { name: "ONNX Runtime", description: "Optimized model inference", icon: "⚙️" }
      ]
    },
    {
      category: "State & Data",
      items: [
        { name: "TanStack Query 5.56.2", description: "Powerful data fetching and caching", icon: "🔄" },
        { name: "React Hook Form 7.53.0", description: "Performant forms with validation", icon: "📝" },
        { name: "Zod 3.23.8", description: "TypeScript-first schema validation", icon: "🛡️" }
      ]
    },
    {
      category: "Development Tools",
      items: [
        { name: "ESLint 9.9.0", description: "Code quality and consistency", icon: "🔍" },
        { name: "PostCSS & Autoprefixer", description: "CSS processing and optimization", icon: "🔧" },
        { name: "React Router DOM 6.26.2", description: "Declarative routing for React", icon: "🛣️" }
      ]
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Dual AI Engine",
      description: "HuggingFace Transformers for privacy-first client-side processing with Google Gemini 2.0 Flash as intelligent fallback",
      color: "text-blue-500"
    },
    {
      icon: Palette,
      title: "Beautiful Design",
      description: "Modern UI built with shadcn/ui and Tailwind CSS, featuring dark/light themes and smooth Framer Motion animations",
      color: "text-purple-500"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live emotion feed, sentiment distribution, smart alerts, and comprehensive statistics dashboard",
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Privacy-First",
      description: "Client-side processing option for sensitive data with optional cloud enhancement",
      color: "text-orange-500"
    },
    {
      icon: Globe,
      title: "Multi-Channel Support",
      description: "Analyze messages from email, chat, phone, social media, and review platforms",
      color: "text-cyan-500"
    },
    {
      icon: Zap,
      title: "High Performance",
      description: "Optimized with ONNX runtime, efficient caching, and progressive loading",
      color: "text-yellow-500"
    }
  ];

  const stats = [
    { label: "Emotion Categories", value: "9+", icon: MessageSquare },
    { label: "AI Models", value: "2", icon: Brain },
    { label: "Channel Types", value: "5+", icon: Globe },
    { label: "UI Components", value: "40+", icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 bg-gradient-card"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-sentiment rounded-xl shadow-glow">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sentinel Sight
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A comprehensive AI-powered customer sentiment analysis tool that monitors and analyzes 
            customer communications in real-time using cutting-edge machine learning technology.
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-sentiment-joy text-white">
              AI Powered
            </Badge>
            <Badge variant="secondary" className="bg-sentiment-optimism text-white">
              Real-time Analysis
            </Badge>
            <Badge variant="secondary" className="bg-sentiment-love text-white">
              Privacy First
            </Badge>
            <Badge variant="secondary" className="bg-sentiment-surprise text-white">
              Open Source
            </Badge>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-border/50 text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the powerful capabilities that make Sentinel Sight 
              the ultimate tool for understanding customer emotions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="bg-gradient-card border-border/50 h-full hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Technology Stack</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern, cutting-edge technologies to deliver exceptional performance, 
              reliability, and developer experience.
            </p>
          </div>

          <div className="space-y-8">
            {techStack.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * categoryIndex }}
              >
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * itemIndex }}
                          className="p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/70 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Architecture Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A robust, scalable architecture designed for performance, privacy, and reliability.
            </p>
          </div>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-500" />
                      AI Processing Pipeline
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Primary: HuggingFace Transformers (Client-side)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Fallback: Google Gemini 2.0 Flash (Cloud)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Automatic failover and confidence scoring</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      Privacy & Security
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Client-side processing for sensitive data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Optional cloud enhancement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>No data persistence by default</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Performance Features
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>ONNX runtime optimization</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Progressive model loading</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Efficient state management</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-cyan-500" />
                      User Experience
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span>Responsive design for all devices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>Dark/light theme support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Smooth animations and transitions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Footer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-6"
        >
          <Separator />
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>using React, TypeScript, and AI</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Version 0.10.0
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              MIT License
            </Badge>
          </div>

          <Button onClick={() => navigate('/')} className="bg-gradient-sentiment hover:shadow-glow">
            <TrendingUp className="mr-2 h-4 w-4" />
            Start Analyzing Sentiment
          </Button>
        </motion.section>
      </div>
    </div>
  );
};

export default About;