# 🤝 Contributing to Customer Sentiment Watchdog

Thank you for your interest in contributing to Customer Sentiment Watchdog! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or discriminatory comments
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended) with suggested extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/customer-sentiment-watchdog.git
cd customer-sentiment-watchdog

# Add the original repository as upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/customer-sentiment-watchdog.git
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm run dev
```

### 3. Environment Setup

```bash
# Copy environment template (if exists)
cp .env.example .env.local

# Configure your development environment
# Add any necessary API keys or configuration
```

### 4. Verify Setup

```bash
# Run the development server
npm run dev

# Run linting
npm run lint

# Check TypeScript compilation
npx tsc --noEmit
```

## 🔄 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new functionality
- 📝 **Documentation**: Improve or add documentation
- 🧪 **Testing**: Add or improve test coverage
- 🎨 **UI/UX**: Enhance the user interface and experience
- 🔧 **Code**: Fix bugs or implement new features
- 🌍 **Translations**: Add multi-language support

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** to discuss major changes
3. **Ask questions** if you're unsure about anything
4. **Start small** with your first contribution

### Creating Issues

When creating an issue, please include:

#### Bug Reports
```markdown
**Bug Description**
A clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js version: [e.g., 18.0.0]
```

#### Feature Requests
```markdown
**Feature Description**
A clear description of the feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you like it to work?

**Alternatives Considered**
Any alternative solutions you've considered

**Additional Context**
Any other context or screenshots
```

## 🔀 Pull Request Process

### 1. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/component-name` - Code refactoring
- `test/test-description` - Adding tests
- `chore/maintenance-task` - Maintenance tasks

### 2. Make Your Changes

```bash
# Make your changes
# Follow the coding standards below

# Test your changes
npm run dev
npm run lint
npm run build
```

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Stage your changes
git add .

# Commit with conventional format
git commit -m "feat: add emotion trend analysis"
git commit -m "fix: resolve AI model loading issue"
git commit -m "docs: update installation guide"
```

#### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Push and Create PR

```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# Use the PR template provided
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Testing
- [ ] I have tested these changes locally
- [ ] I have added/updated tests as needed
- [ ] All existing tests pass

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated documentation as needed
- [ ] My changes generate no new warnings
```

## 📏 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface SentimentResult {
  emotion: string;
  confidence: number;
  timestamp: Date;
}

// ✅ Good: Use meaningful names
const analyzeSentiment = async (message: string): Promise<SentimentResult> => {
  // Implementation
};

// ❌ Avoid: Any types
const result: any = await analyze(data);

// ❌ Avoid: Unclear names
const doStuff = (x: any) => {
  // Implementation
};
```

### React Component Guidelines

```tsx
// ✅ Good: Functional components with TypeScript
interface SentimentFormProps {
  onAnalyze: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const SentimentForm: React.FC<SentimentFormProps> = ({
  onAnalyze,
  isLoading
}) => {
  // Component implementation
};

// ✅ Good: Use custom hooks for logic
const useSentimentAnalysis = () => {
  // Hook implementation
};

// ✅ Good: Proper prop destructuring
const { isLoading, error, data } = useSentimentAnalysis();
```

### CSS/Styling Guidelines

```tsx
// ✅ Good: Use Tailwind classes
<div className="bg-gradient-card border-border/50 shadow-card">
  <h1 className="text-2xl font-bold text-primary">Title</h1>
</div>

// ✅ Good: Use CSS variables for consistency
<div style={{ color: 'var(--primary)' }}>Content</div>

// ❌ Avoid: Inline styles for complex styling
<div style={{ backgroundColor: '#123456', padding: '20px' }}>
```

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── SentimentForm/   # Feature-specific components
│   │   ├── index.tsx
│   │   ├── SentimentForm.tsx
│   │   └── SentimentForm.test.tsx
├── hooks/               # Custom React hooks
├── services/            # External service integrations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── constants/           # Application constants
```

### Import Organization

```typescript
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 2. Internal components and hooks
import { Button } from '@/components/ui/button';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';

// 3. Types and interfaces
import type { SentimentResult } from '@/types';

// 4. Constants and utilities
import { EMOTION_COLORS } from '@/constants';
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Example test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { SentimentForm } from './SentimentForm';

describe('SentimentForm', () => {
  it('should render form elements', () => {
    render(<SentimentForm onAnalyze={jest.fn()} isLoading={false} />);
    
    expect(screen.getByLabelText(/customer message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
  });

  it('should call onAnalyze when form is submitted', async () => {
    const mockAnalyze = jest.fn();
    render(<SentimentForm onAnalyze={mockAnalyze} isLoading={false} />);
    
    const input = screen.getByLabelText(/customer message/i);
    const button = screen.getByRole('button', { name: /analyze/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);
    
    expect(mockAnalyze).toHaveBeenCalledWith('Test message');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test SentimentForm.test.tsx
```

## 📝 Documentation

### Code Documentation

```typescript
/**
 * Analyzes the sentiment of a given message using AI models
 * 
 * @param message - The text message to analyze
 * @param customerId - Optional customer identifier
 * @param channel - Optional communication channel
 * @returns Promise resolving to sentiment analysis result
 * 
 * @example
 * ```typescript
 * const result = await analyzeSentiment("I love this product!");
 * console.log(result.emotion); // "joy"
 * console.log(result.confidence); // 0.95
 * ```
 */
export const analyzeSentiment = async (
  message: string,
  customerId?: string,
  channel?: string
): Promise<SentimentResult> => {
  // Implementation
};
```

### Component Documentation

```tsx
/**
 * SentimentForm - A form component for inputting and analyzing customer messages
 * 
 * Features:
 * - Message input with validation
 * - Optional customer ID and channel selection
 * - Real-time analysis with loading states
 * - Example message templates
 * 
 * @param onAnalyze - Callback function to handle message analysis
 * @param isLoading - Whether analysis is in progress
 * @param result - Latest analysis result to display
 */
export const SentimentForm: React.FC<SentimentFormProps> = ({
  onAnalyze,
  isLoading,
  result
}) => {
  // Component implementation
};
```

### README Updates

When adding new features, update the README.md:

1. Add feature to the features list
2. Update installation instructions if needed
3. Add usage examples
4. Update the tech stack if new dependencies are added

## 🌟 Recognition

Contributors will be recognized in:

- **README.md** - Contributors section
- **CHANGELOG.md** - Release notes
- **GitHub Releases** - Release descriptions
- **Project documentation** - Acknowledgments

### Contributor Levels

- **🌱 First-time Contributor**: Made their first contribution
- **🔧 Regular Contributor**: Multiple meaningful contributions
- **🎯 Core Contributor**: Significant ongoing contributions
- **🏆 Maintainer**: Trusted with project maintenance

## 💬 Community

### Getting Help

- **💬 Discussions**: Use GitHub Discussions for questions
- **🐛 Issues**: Report bugs and request features
- **📧 Email**: contact@sentiment-watchdog.com
- **💬 Discord**: [Join our Discord server](#) (coming soon)

### Communication Guidelines

- **Be respectful** and professional
- **Be patient** - maintainers are volunteers
- **Be specific** when asking questions
- **Search first** before asking duplicate questions
- **Help others** when you can

## 🎯 Areas for Contribution

### High Priority
- **🧪 Testing**: Increase test coverage
- **📱 Mobile**: Improve mobile responsiveness
- **♿ Accessibility**: Enhance accessibility features
- **🌍 Internationalization**: Add multi-language support

### Medium Priority
- **📊 Analytics**: Advanced reporting features
- **🔌 Integrations**: New AI providers or data sources
- **🎨 Themes**: Additional color schemes
- **📖 Documentation**: API documentation and guides

### Future Features
- **📱 Mobile App**: Native mobile applications
- **🤖 Custom Models**: Train custom emotion detection models
- **☁️ Cloud Platform**: Hosted solution
- **🏢 Enterprise**: Advanced enterprise features

## 📚 Resources

### Learning Resources
- **React**: [Official React Documentation](https://react.dev/)
- **TypeScript**: [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/docs)
- **HuggingFace**: [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)

### Project Resources
- **Design System**: [shadcn/ui Components](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🙏 Thank You

Thank you for contributing to Customer Sentiment Watchdog! Your contributions help make this project better for everyone. Every contribution, no matter how small, is valuable and appreciated.

---

**Happy Contributing! 🚀**

*Built with ❤️ by the Customer Sentiment Watchdog community*