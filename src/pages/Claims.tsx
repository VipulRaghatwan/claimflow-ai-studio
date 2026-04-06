import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, BarChart3, Settings, Search, Bell, User,
  Zap, Menu, X, LogOut, Plus, Clock, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Claim {
  id: string;
  claim_number: string;
  status: string;
  damage_severity: string | null;
  estimated_cost: number | null;
  fraud_risk: string | null;
  created_at: string;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: FileText, label: "Claims", to: "/claims" },
  { icon: BarChart3, label: "Analytics", to: "/analytics" },
  { icon: Settings, label: "Settings", to: "/dashboard" },
];

const statusColor: Record<string, string> = {
  processing: "bg-warning/20 text-warning",
  analyzed: "bg-primary/20 text-primary",
  approved: "bg-success/20 text-success",
  denied: "bg-destructive/20 text-destructive",
};

const Claims = () => {
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchClaims = async () => {
      const { data, error } = await supabase
        .from("claims")
        .select("id, claim_number, status, damage_severity, estimated_cost, fraud_risk, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setClaims(data as unknown as Claim[]);
      }
      setLoading(false);
    };
    fetchClaims();
  }, []);

  const filtered = claims.filter(
    (c) =>
      c.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.damage_severity || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">ClaimFlow AI</span>
          <button className="lg:hidden ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                location.pathname === item.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-border">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-background/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center gap-4 px-4 md:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              className="pl-9 bg-secondary border-border rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/upload">
              <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" /> New Claim
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display">Claim History</h1>
            <p className="text-sm text-muted-foreground mt-1">All your submitted claims and AI analysis results</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold font-display mb-2">No claims yet</h3>
              <p className="text-muted-foreground mb-4">Upload your first claim to get started with AI analysis.</p>
              <Link to="/upload">
                <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Upload Claim
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((claim, i) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/claim-result/${claim.id}`}>
                    <div className="glass p-4 md:p-5 hover:border-primary/40 transition-colors cursor-pointer flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold font-display">{claim.claim_number}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${statusColor[claim.status] || "bg-muted/20 text-muted-foreground"}`}>
                            {claim.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          {claim.damage_severity && <span>Severity: {claim.damage_severity}</span>}
                          {claim.estimated_cost && <span>Cost: ${claim.estimated_cost.toLocaleString()}</span>}
                          {claim.fraud_risk && <span>Fraud: {claim.fraud_risk}</span>}
                          <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Claims;
