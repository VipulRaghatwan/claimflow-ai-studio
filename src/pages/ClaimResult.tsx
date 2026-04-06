import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, Shield, FileText, DollarSign, Activity, Loader2, Eye, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CostItem {
  item: string;
  cost: number;
}

interface OcrData {
  vehicle_info?: string;
  date_of_incident?: string;
  policy_number?: string;
  additional_notes?: string;
}

interface Claim {
  id: string;
  claim_number: string;
  status: string;
  damage_severity: string | null;
  damage_description: string | null;
  estimated_cost: number | null;
  cost_breakdown: CostItem[] | null;
  fraud_risk: string | null;
  fraud_details: string | null;
  confidence_score: number | null;
  ocr_extracted_data: OcrData | null;
  ai_report: string | null;
  ai_recommendation: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

const ClaimResult = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: "approved" | "denied") => {
    if (!id || !claim) return;
    setUpdating(true);
    const { error } = await supabase
      .from("claims")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update claim status");
    } else {
      setClaim({ ...claim, status: newStatus });
      toast.success(`Claim ${newStatus} successfully`);
    }
    setUpdating(false);
  };

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("claims")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to load claim");
        console.error(error);
      } else {
        setClaim(data as unknown as Claim);
      }
      setLoading(false);
    };
    fetchClaim();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen animated-bg">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold font-display">Claim not found</h1>
          <Link to="/dashboard" className="text-primary mt-4 inline-block">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const severityBadge: Record<string, string> = {
    Minor: "bg-success/20 text-success",
    Moderate: "bg-warning/20 text-warning",
    Severe: "bg-destructive/20 text-destructive",
    "Total Loss": "bg-destructive/20 text-destructive",
  };

  const fraudBadge: Record<string, string> = {
    Low: "bg-success/20 text-success",
    Medium: "bg-warning/20 text-warning",
    High: "bg-destructive/20 text-destructive",
  };

  const costBreakdown = (claim.cost_breakdown as CostItem[]) || [];
  const ocrData = (claim.ocr_extracted_data as OcrData) || {};

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        <Link to="/claims" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Claims
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            Claim <span className="gradient-text">Analysis</span>
          </h1>
          <p className="text-muted-foreground mb-8">AI-generated report for {claim.claim_number}</p>
        </motion.div>

        {/* Summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Activity,
              label: "Damage Severity",
              value: claim.damage_severity || "N/A",
              badge: severityBadge[claim.damage_severity || ""] || "bg-muted/20 text-muted-foreground",
            },
            {
              icon: DollarSign,
              label: "Estimated Cost",
              value: claim.estimated_cost ? `$${claim.estimated_cost.toLocaleString()}` : "N/A",
              badge: "bg-primary/20 text-primary",
            },
            {
              icon: Shield,
              label: "Fraud Risk",
              value: claim.fraud_risk || "N/A",
              badge: fraudBadge[claim.fraud_risk || ""] || "bg-muted/20 text-muted-foreground",
            },
            {
              icon: CheckCircle,
              label: "Confidence",
              value: claim.confidence_score ? `${claim.confidence_score}%` : "N/A",
              badge: "bg-cyan/20 text-cyan",
            },
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
                  {card.label === "Fraud Risk" && claim.fraud_risk === "Low" ? "✓" : ""}
                  {card.label === "Damage Severity" && (claim.damage_severity === "Moderate" || claim.damage_severity === "Severe") ? "⚠" : ""}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* OCR Extracted Data */}
        {Object.values(ocrData).some(Boolean) && (
          <motion.div className="glass p-6 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display">OCR Extracted Data</h2>
                <p className="text-xs text-muted-foreground">Automatically extracted from uploaded documents</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {ocrData.vehicle_info && (
                <div className="glass-subtle p-3 rounded-lg">
                  <span className="text-xs text-muted-foreground">Vehicle Info</span>
                  <p className="text-sm font-medium">{ocrData.vehicle_info}</p>
                </div>
              )}
              {ocrData.date_of_incident && (
                <div className="glass-subtle p-3 rounded-lg">
                  <span className="text-xs text-muted-foreground">Date of Incident</span>
                  <p className="text-sm font-medium">{ocrData.date_of_incident}</p>
                </div>
              )}
              {ocrData.policy_number && (
                <div className="glass-subtle p-3 rounded-lg">
                  <span className="text-xs text-muted-foreground">Policy Number</span>
                  <p className="text-sm font-medium">{ocrData.policy_number}</p>
                </div>
              )}
              {ocrData.additional_notes && (
                <div className="glass-subtle p-3 rounded-lg sm:col-span-2">
                  <span className="text-xs text-muted-foreground">Additional Notes</span>
                  <p className="text-sm font-medium">{ocrData.additional_notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Report */}
        <motion.div
          className="glass p-6 md:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">AI-Generated Report</h2>
              <p className="text-xs text-muted-foreground">
                Generated in {claim.processing_time_ms ? `${(claim.processing_time_ms / 1000).toFixed(1)}s` : "N/A"}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            {/* Damage Assessment */}
            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Damage Assessment</h3>
              <p>{claim.damage_description || claim.ai_report || "No damage assessment available."}</p>
            </div>

            {/* Cost Breakdown */}
            {costBreakdown.length > 0 && (
              <div>
                <h3 className="text-foreground font-semibold font-display mb-2">Cost Breakdown</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {costBreakdown.map((line) => (
                    <div key={line.item} className="flex justify-between items-center glass-subtle p-3 rounded-lg">
                      <span>{line.item}</span>
                      <span className="font-medium text-foreground">${line.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fraud Analysis */}
            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Fraud Analysis</h3>
              <div className="glass-subtle p-4 rounded-lg flex items-start gap-3">
                {claim.fraud_risk === "Low" ? (
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-foreground font-medium mb-1">
                    {claim.fraud_risk === "Low" ? "No fraud indicators detected" : `${claim.fraud_risk} fraud risk detected`}
                  </p>
                  <p>{claim.fraud_details || "No details available."}</p>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <h3 className="text-foreground font-semibold font-display mb-2">Recommendation</h3>
              <div className="glass-subtle p-4 rounded-lg flex items-start gap-3 border-l-2 border-primary">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p>{claim.ai_recommendation || "No recommendation available."}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        {(claim.status === "approved" || claim.status === "denied") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass p-4 mb-6 flex items-center gap-3 border-l-4 ${
              claim.status === "approved" ? "border-l-success" : "border-l-destructive"
            }`}
          >
            {claim.status === "approved" ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <span className="font-semibold capitalize">{claim.status}</span>
            <span className="text-sm text-muted-foreground">
              — Updated {new Date(claim.created_at).toLocaleDateString()}
            </span>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {claim.status === "analyzed" && (
            <>
              <Button
                onClick={() => handleStatusChange("approved")}
                disabled={updating}
                className="rounded-xl bg-success text-success-foreground hover:bg-success/90 flex-1"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Approve Claim
              </Button>
              <Button
                onClick={() => handleStatusChange("denied")}
                disabled={updating}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 flex-1"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle className="h-4 w-4 mr-2" />}
                Deny Claim
              </Button>
            </>
          )}
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
