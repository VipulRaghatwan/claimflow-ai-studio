import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">ClaimFlow AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <Link to="/upload" className="hover:text-foreground transition-colors">Upload</Link>
          <Link to="/claim-result" className="hover:text-foreground transition-colors">Results</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth">
            <Button size="sm" variant="ghost" className="rounded-xl">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-glass-border/50 p-4 space-y-3">
          <Link to="/" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/dashboard" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/upload" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Upload</Link>
          <Link to="/claim-result" className="block text-sm py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>Results</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
