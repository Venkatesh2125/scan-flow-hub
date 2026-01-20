import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-background border-b border-gray-200">
      <div className="max-w-[100rem] mx-auto px-8 md:px-16 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-heading text-2xl text-textprimary hover:text-primary transition-colors">
            DocuScan
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="font-paragraph text-base text-textprimary hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/documents" 
              className="font-paragraph text-base text-textprimary hover:text-primary transition-colors"
            >
              Documents
            </Link>
            <Link 
              to="/documents" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-paragraph text-sm hover:opacity-90 transition-opacity"
            >
              {`{ Upload }`}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-textprimary hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-6 pt-6 border-t border-gray-200 flex flex-col gap-4">
            <Link 
              to="/" 
              className="font-paragraph text-base text-textprimary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/documents" 
              className="font-paragraph text-base text-textprimary hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Documents
            </Link>
            <Link 
              to="/documents" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-paragraph text-sm hover:opacity-90 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              {`{ Upload }`}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
