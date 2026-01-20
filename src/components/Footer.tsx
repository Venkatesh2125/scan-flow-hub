import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-secondary border-t border-secondary-foreground">
      <div className="max-w-[100rem] mx-auto px-8 md:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl text-secondary-foreground mb-4">
              DocuScan
            </h3>
            <p className="font-paragraph text-sm text-secondary-foreground">
              Advanced document intelligence platform powered by OCR technology
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg text-secondary-foreground mb-4">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/documents" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors"
              >
                Documents
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg text-secondary-foreground mb-4">
              Support
            </h4>
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:support@docuscan.com" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors"
              >
                support@docuscan.com
              </a>
              <p className="font-paragraph text-sm text-secondary-foreground">
                Available 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-paragraph text-sm text-secondary-foreground">
              © {currentYear} DocuScan. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a 
                href="#" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
