import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, Shield, FileText, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";

const ClaimResult = () => {
  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            Claim <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mb-8">AI-generated report for Claim #CLM-8841</p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Activity, label: "Damage Severity", value: "Moderate", badge: "bg-warning/20 text-warning" },
            { icon: DollarSign, label: "Estimated Cost", value: "$12,400", badge: "bg-primary/20 text-primary" },
            { icon: Shield, label: "Fraud Risk", value: "Low", badge: "bg-success/20 text-success" },
            { icon: CheckCircle, label: "Confidence", value: "94.7%", badge: "bg-cyan/20 text-cyan" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              className="glass p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <card.icon className="h-5 w-5 text-muted-foreground mb-3" />
              <div className="text-xs text-muted-foreground mb-1">{card.label}</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-display">{card.value}</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${card.badge}`}>
                  {card.label === "Damage Severity" ? "⚠" : card.label === "Fraud Risk" ? "✓" : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Report */}
        <motion.div
          className="glass p-6 md:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">AI-Generated Report</h2>
              <p className="text-xs text-muted-foreground">Generated in 4.2 seconds</p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Damage Assessment</h3>
              <p>
                The AI vision model detected moderate front-end collision damage to a 2023 Toyota Camry. 
                Primary impact zone includes the front bumper, hood, and left headlight assembly. 
                No structural frame damage detected. Paint damage extends approximately 18 inches across the front fascia.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Cost Breakdown</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { item: "Front Bumper Replacement", cost: "$4,200" },
                  { item: "Hood Repair & Repaint", cost: "$3,800" },
                  { item: "Headlight Assembly", cost: "$2,100" },
                  { item: "Labor & Misc.", cost: "$2,300" },
                ].map((line) => (
                  <div key={line.item} className="flex justify-between items-center glass-subtle p-3 rounded-lg">
                    <span>{line.item}</span>
                    <span className="font-medium text-foreground">{line.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Fraud Analysis</h3>
              <div className="glass-subtle p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="text-foreground font-medium mb-1">No fraud indicators detected</p>
                  <p>
                    Damage patterns are consistent with reported incident. Image metadata and timestamps verified. 
                    No prior claims on this vehicle in the last 24 months. Risk score: 12/100 (Low).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Recommendation</h3>
              <div className="glass-subtle p-4 rounded-lg flex items-start gap-3 border-l-2 border-primary">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p>
                  Recommend approval for full estimated amount of <strong className="text-foreground">$12,400</strong>. 
                  All damage is consistent with a front-end collision at low-to-moderate speed. 
                  Suggest scheduling an in-person inspection for final verification before payout.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
            Approve Claim
          </Button>
          <Button variant="outline" className="rounded-xl border-glass-border text-foreground hover:bg-secondary flex-1">
            Request Review
          </Button>
          <Link to="/upload" className="flex-1">
            <Button variant="outline" className="rounded-xl border-glass-border text-foreground hover:bg-secondary w-full">
              New Claim
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClaimResult;
