import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Facebook, Instagram, Linkedin, Twitter, Github, Mail, Brain, BarChart3 } from "lucide-react"

function StackedCircularFooter() {
  return (
    <footer className="bg-background py-12 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Logo Section with Sentiment Analysis Theme */}
          <div className="mb-8 rounded-full bg-gradient-to-br from-primary/20 to-sentiment-joy/20 p-8 shadow-lg">
            <div className="flex items-center gap-2">
              <Icons.brain className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-sentiment-joy bg-clip-text text-transparent">
                Sentinel Sight
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <a href="/" className="hover:text-primary transition-colors duration-200 flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </a>
            <a href="/about" className="hover:text-primary transition-colors duration-200">
              About
            </a>
            <a href="#analytics" className="hover:text-primary transition-colors duration-200">
              Analytics
            </a>
            <a href="#features" className="hover:text-primary transition-colors duration-200">
              Features
            </a>
            <a href="#api" className="hover:text-primary transition-colors duration-200">
              API
            </a>
            <a href="#contact" className="hover:text-primary transition-colors duration-200 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Contact
            </a>
          </nav>

          {/* Social Media Links */}
          <div className="mb-8 flex space-x-4">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 transition-colors duration-200">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 transition-colors duration-200">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 transition-colors duration-200">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 transition-colors duration-200">
              <Mail className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </Button>
          </div>

          {/* Newsletter Subscription */}
          <div className="mb-8 w-full max-w-md">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">
                Get the latest insights on sentiment analysis and AI trends
              </p>
            </div>
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input 
                  id="email" 
                  placeholder="Enter your email" 
                  type="email" 
                  className="rounded-full border-primary/20 focus:border-primary" 
                />
              </div>
              <Button type="submit" className="rounded-full bg-gradient-to-r from-primary to-sentiment-joy hover:from-primary/90 hover:to-sentiment-joy/90">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Footer Bottom */}
          <div className="text-center space-y-2">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-2">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Sentinel Sight. Powered by AI for intelligent sentiment analysis.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Built with ❤️ using React, TypeScript & HuggingFace Transformers
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }