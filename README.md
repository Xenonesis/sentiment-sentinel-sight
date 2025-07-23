# 🧠 Sentinel Sight

<div align="center">

![Sentinel Sight Banner](https://img.shields.io/badge/🧠%20Sentinel%20Sight-AI%20Powered%20Sentiment%20Analysis-6366f1?style=for-the-badge&labelColor=1e293b&color=6366f1)

![Version](https://img.shields.io/badge/version-1.1.0-22c55e?style=for-the-badge&logo=semver&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![AI](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.11-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**🎯 Enterprise-grade AI-powered sentiment analysis platform with real-time emotion detection, advanced analytics, and beautiful modern UI/UX**

<p align="center">
  <strong>Transform customer communications into actionable insights with cutting-edge AI technology</strong>
</p>

[🚀 Quick Start](#-quick-start) • [✨ Features](#-comprehensive-feature-set) • [🏗️ Architecture](#-quad-ai-engine-architecture) • [📊 Analytics](#-advanced-analytics) • [🛠️ Tech Stack](#-technology-stack) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 **What Makes Sentinel Sight Special?**

<table>
<tr>
<td width="50%">

### 🧠 **Quad AI Engine**
- **Client-side Privacy**: HuggingFace Transformers for sensitive data
- **Local AI Power**: Ollama for private, offline AI models
- **Cloud Power**: Google Gemini 2.0 Flash for enhanced accuracy
- **Sentiment API**: Additional analysis engine for comprehensive results
- **Smart Failover**: Automatic switching between AI providers
- **Confidence Scoring**: Precise accuracy percentages

</td>
<td width="50%">

### 📊 **Advanced Analytics**
- **Real-time Dashboard**: Live emotion feed and statistics
- **Trend Analysis**: Historical patterns and insights
- **Bulk Processing**: CSV upload for batch analysis
- **Export Capabilities**: Multiple formats for data export

</td>
</tr>
<tr>
<td width="50%">

### 🎨 **Modern UI/UX**
- **Glassmorphism Design**: Beautiful translucent effects
- **Dark/Light Themes**: Automatic and manual switching
- **Responsive Layout**: Mobile-first design approach
- **Smooth Animations**: Framer Motion throughout

</td>
<td width="50%">

### 🔒 **Enterprise Ready**
- **Privacy First**: Client-side processing option
- **Multi-channel**: Email, chat, phone, social, reviews
- **Customer Tracking**: Optional ID-based insights
- **Scalable Architecture**: Built for growth

</td>
</tr>
</table>

---

## 🛠️ **Technology Stack**

<table>
<tr>
<td width="50%">

### **🎯 Frontend Core**
- **React 18.3.1**: Modern React with concurrent features
- **TypeScript 5.5.3**: Type-safe development
- **Vite 5.4.1**: Lightning-fast build tool
- **React Router 6.26.2**: Client-side routing
- **TanStack Query 5.56.2**: Server state management

### **🎨 UI & Styling**
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion 12.23.6**: Animation library
- **Lucide React**: Beautiful icon library
- **Next Themes**: Dark/light mode support

</td>
<td width="50%">

### **🤖 AI & Analytics**
- **HuggingFace Transformers 3.6.3**: Client-side ML models
- **Google Gemini API**: Cloud-based AI analysis
- **Ollama Integration**: Local AI model support
- **Recharts 3.1.0**: Data visualization
- **Date-fns 3.6.0**: Date manipulation

### **📋 Forms & Validation**
- **React Hook Form 7.53.0**: Performant forms
- **Zod 3.23.8**: Schema validation
- **Hookform Resolvers 3.9.0**: Form validation integration

### **🔧 Development Tools**
- **ESLint 9.9.0**: Code linting
- **TypeScript ESLint**: TypeScript-specific linting
- **Autoprefixer**: CSS vendor prefixes

</td>
</tr>
</table>

---

## ✨ **Comprehensive Feature Set**

<details>
<summary><strong>🧠 Quad AI Engine Architecture</strong></summary>

### 🤖 **HuggingFace Transformers (Client-side)**
```typescript
// Privacy-first emotion detection with lazy loading
const { pipeline } = await import('@huggingface/transformers');
const model = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
```
- **🔒 Complete Privacy**: All processing happens in your browser
- **⚡ Lazy Loading**: Models loaded only when needed for optimal performance
- **🌐 Offline Capable**: Works without internet connection after initial load
- **🎯 Optimized Models**: Uses efficient ONNX models for browser compatibility

### 🚀 **Google Gemini 2.0 Flash (Cloud-based)**
```typescript
// Enhanced accuracy with cloud AI
const analysis = await analyzeWithGemini(message);
```
- **🧠 Advanced Reasoning**: Context-aware sentiment analysis with detailed explanations
- **📈 Higher Accuracy**: Superior performance on complex messages and nuanced emotions
- **🔄 Smart Fallback**: Automatic failover to local models when unavailable
- **📊 Confidence Metrics**: Detailed accuracy scoring with reasoning explanations

### 🏠 **Ollama Local AI (Self-hosted)**
```typescript
// Local AI models with complete privacy
const result = await analyzeWithOllama(message, 'llama2');
```
- **🔒 Complete Privacy**: All processing on your local machine
- **🌐 Offline Capable**: Works without internet connection
- **💰 Cost-free**: No API costs after model download
- **🎯 Model Choice**: Select from various AI models (Llama2, Mistral, CodeLlama, etc.)
- **⚡ High Performance**: Optimized for local hardware with configurable parameters

### ⚡ **Sentiment Analysis API (Third-party)**
```typescript
// Additional analysis engine with fallback support
const result = await analyzeSentiment(message);
```
- **🔗 Dual API Integration**: MeaningCloud and Twinword APIs with automatic fallback
- **📊 Enhanced Coverage**: Keyword-based fallback analysis for maximum reliability
- **🔄 Smart Failover**: Automatic switching between primary and backup APIs
- **⚙️ Configurable Timeout**: Customizable request timeouts and retry logic

</details>

<details>
<summary><strong>🎨 Modern UI/UX Design System</strong></summary>

### **✨ Glassmorphism Effects**
- **Translucent Cards**: Beautiful frosted glass appearance
- **Backdrop Blur**: Sophisticated depth and layering
- **Gradient Borders**: Dynamic color transitions
- **Shadow Depth**: Multi-layer shadow system

### **🌈 Advanced Theming**
- **🌙 Dark Mode**: OLED-friendly deep blacks
- **☀️ Light Mode**: High contrast accessibility
- **🎨 Custom Themes**: Sentiment-based color schemes
- **⚡ Instant Switching**: Smooth theme transitions

### **📱 Responsive Design**
- **Mobile First**: Optimized for touch interfaces with mobile-specific components
- **Touch-Friendly**: Large tap targets and gesture-based interactions
- **Adaptive Layout**: Fluid grid system that works on all screen sizes
- **Performance Optimized**: Lazy loading and code splitting for mobile devices

### **🎨 Advanced UI Components**
- **Radix UI Foundation**: Built on robust, accessible component primitives
- **Custom Design System**: Consistent styling with CSS variables and Tailwind CSS
- **Framer Motion**: Smooth animations and micro-interactions throughout
- **Responsive Charts**: Interactive data visualizations with Recharts

</details>

<details>
<summary><strong>📊 Advanced Analytics & Data Management</strong></summary>

### **📈 Real-time Analytics Dashboard**
- **Live Emotion Feed**: Real-time sentiment tracking with live updates
- **Trend Analysis**: Historical patterns with time-based filtering (24h, 7d, 30d, 90d)
- **Interactive Charts**: Bar charts, pie charts, area charts, and line graphs
- **Performance Metrics**: Response times, confidence scores, and accuracy tracking

### **📋 Bulk Analysis & Export**
- **CSV Upload**: Batch processing of customer messages
- **Progress Tracking**: Real-time progress indicators with error handling
- **Data Export**: Export results in CSV or JSON format with filtering options
- **Advanced Filtering**: Filter by emotion, channel, confidence, date range

### **🔧 User Settings & Preferences**
- **API Configuration**: Easy setup for Gemini, Ollama, and third-party APIs
- **Model Selection**: Choose preferred AI models and fallback order
- **Form Persistence**: Remember form data and user preferences
- **Advanced Settings**: Timeout configuration, model parameters, and retry logic

</details>

<details>
<summary><strong>🏗️ Technical Architecture</strong></summary>

### **⚡ Performance Optimizations**
- **Code Splitting**: Automatic chunking for optimal loading
- **Lazy Loading**: AI models and components loaded on demand
- **Bundle Optimization**: Separate chunks for vendor, UI, charts, and AI libraries
- **Memory Management**: Efficient handling of large AI models

### **🔒 Privacy & Security**
- **Client-side Processing**: Local analysis option for sensitive data
- **No Data Storage**: Messages processed in real-time without persistence
- **Configurable Privacy**: Choose between local and cloud processing
- **Secure API Integration**: Encrypted communication with external services

</details>

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Modern web browser with WebAssembly support
- (Optional) Ollama installed locally for self-hosted AI

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-username/sentinel-sight.git
cd sentinel-sight

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Configuration**

1. **Google Gemini API** (Optional but recommended)
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add key in Settings → API Configuration

2. **Ollama Setup** (Optional for local AI)
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull a recommended model
   ollama pull llama2
   ```

3. **Start Analyzing**
   - Open http://localhost:8080
   - Enter a message and click "Analyze Sentiment"
   - Explore the analytics dashboard

### **Build for Production**

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

---

## 📊 **Advanced Analytics**

The application includes a comprehensive analytics dashboard with:

- **📈 Real-time Metrics**: Live emotion tracking and confidence scores
- **📊 Interactive Charts**: Multiple chart types for data visualization
- **🔍 Advanced Filtering**: Filter by time range, emotion, channel, confidence
- **📤 Data Export**: Export analysis results in CSV or JSON format
- **📋 Bulk Processing**: Upload CSV files for batch sentiment analysis
- **🎯 Customer Insights**: Track customer satisfaction and sentiment trends

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Project Structure**

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── services/           # API and AI service integrations
├── utils/              # Utility functions
├── contexts/           # React contexts
└── pages/              # Page components
```

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using React, TypeScript, and AI**

[⭐ Star this repo](https://github.com/your-username/sentinel-sight) • [🐛 Report Bug](https://github.com/your-username/sentinel-sight/issues) • [💡 Request Feature](https://github.com/your-username/sentinel-sight/issues)

</div>[Response interrupted by API Error]
