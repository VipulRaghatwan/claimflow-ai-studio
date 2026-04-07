import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, Image, ScanLine, Loader2, ArrowLeft, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OcrResult {
  name: string | null;
  date: string | null;
  amount: string | null;
  policy_number: string | null;
  damage_type: string | null;
  raw_text: string;
}

const OcrScanner = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedResult, setEditedResult] = useState<OcrResult | null>(null);

  const handleFile = useCallback((f: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!validTypes.includes(f.type)) {
      toast.error("Invalid file type. Use JPG, PNG, WebP, GIF, or PDF.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error("File too large. Maximum 20MB.");
      return;
    }
    setFile(f);
    setResult(null);
    setEditMode(false);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-scan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "OCR scan failed");
      }

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
        setEditedResult(json.data);
        toast.success("Document scanned successfully!");
      } else {
        throw new Error("No data returned");
      }
    } catch (error: any) {
      console.error("OCR error:", error);
      toast.error(error.message || "OCR scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSaveEdits = () => {
    if (editedResult) {
      setResult(editedResult);
      setEditMode(false);
      toast.success("Changes saved!");
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setEditMode(false);
  };

  const fields = [
    { key: "name", label: "Name", icon: "👤" },
    { key: "date", label: "Date", icon: "📅" },
    { key: "amount", label: "Amount", icon: "💰" },
    { key: "policy_number", label: "Policy Number", icon: "📋" },
    { key: "damage_type", label: "Damage Type", icon: "⚠️" },
  ] as const;

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            OCR <span className="gradient-text">Scanner</span>
          </h1>
          <p className="text-muted-foreground mb-8">Upload any document or image to extract text and structured data using AI.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & Preview */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            {!file ? (
              <div
                className={`glass border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                  dragging ? "border-primary bg-primary/5" : "border-glass-border hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("ocr-file-input")?.click()}
              >
                <input
                  id="ocr-file-input"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                  <ScanLine className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-1">Drop a document here</h3>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP, GIF, PDF • Max 20MB</p>
              </div>
            ) : (
              <Card className="glass border-glass-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    {file.type.startsWith("image/") ? <Image className="h-5 w-5 text-accent" /> : <FileText className="h-5 w-5 text-primary" />}
                    {file.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={clearFile} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain rounded-xl border border-glass-border" />
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-secondary/50 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground" />
                      <span className="ml-3 text-muted-foreground">PDF Document</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{(file.size / 1024).toFixed(1)} KB • {file.type}</p>
                </CardContent>
              </Card>
            )}

            {file && !scanning && (
              <Button
                onClick={handleScan}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground py-6 text-lg"
              >
                <ScanLine className="mr-2 h-5 w-5" /> Scan Document
              </Button>
            )}

            {scanning && (
              <Card className="glass border-glass-border">
                <CardContent className="py-8 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    <ScanLine className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold font-display mb-1">Scanning Document...</h3>
                  <p className="text-sm text-muted-foreground">AI is extracting text and analyzing content</p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right: Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            {result ? (
              <>
                <Card className="glass border-glass-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-display">Extracted Data</CardTitle>
                    <div className="flex gap-2">
                      {editMode ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setEditedResult(result); }}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveEdits} className="bg-primary text-primary-foreground">
                            <Save className="h-4 w-4 mr-1" /> Save
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                          <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fields.map(({ key, label, icon }) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-lg">{icon}</span>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>
                          {editMode ? (
                            <Input
                              value={editedResult?.[key] || ""}
                              onChange={(e) => setEditedResult((prev) => prev ? { ...prev, [key]: e.target.value || null } : prev)}
                              className="mt-1 bg-secondary/50 border-glass-border"
                            />
                          ) : (
                            <p className="text-sm font-medium">{result[key] || <span className="text-muted-foreground italic">Not found</span>}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass border-glass-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-display">Raw OCR Text</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editMode ? (
                      <Textarea
                        value={editedResult?.raw_text || ""}
                        onChange={(e) => setEditedResult((prev) => prev ? { ...prev, raw_text: e.target.value } : prev)}
                        className="min-h-[200px] bg-secondary/50 border-glass-border font-mono text-xs"
                      />
                    ) : (
                      <div className="bg-secondary/50 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                          {result.raw_text || "No text extracted"}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass border-glass-border">
                <CardContent className="py-16 text-center">
                  <ScanLine className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-semibold font-display text-muted-foreground mb-1">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground">Upload a document and click "Scan Document" to extract data</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OcrScanner;
