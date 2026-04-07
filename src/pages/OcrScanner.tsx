import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ScanLine, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import { toast } from "sonner";
import DropZone from "@/components/ocr/DropZone";
import FileQueue from "@/components/ocr/FileQueue";
import ResultPanel from "@/components/ocr/ResultPanel";
import { BatchFile, OcrResult } from "@/components/ocr/types";

const OcrScanner = () => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const batch: BatchFile[] = newFiles.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      status: "pending" as const,
      result: null,
      error: null,
    }));
    setFiles((prev) => [...prev, ...batch]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const scanSingle = async (bf: BatchFile): Promise<BatchFile> => {
    const formData = new FormData();
    formData.append("file", bf.file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-scan`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "OCR scan failed");
      }

      const json = await response.json();
      if (json.success && json.data) {
        return { ...bf, status: "done", result: json.data };
      }
      throw new Error("No data returned");
    } catch (e: any) {
      return { ...bf, status: "error", error: e.message || "Unknown error" };
    }
  };

  const handleScanAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) {
      toast.info("No pending files to scan");
      return;
    }

    setScanning(true);

    for (const bf of pending) {
      setFiles((prev) => prev.map((f) => f.id === bf.id ? { ...f, status: "scanning" } : f));
      const result = await scanSingle(bf);
      setFiles((prev) => prev.map((f) => f.id === bf.id ? result : f));

      if (result.status === "done" && !selectedId) {
        setSelectedId(result.id);
      }
    }

    setScanning(false);
    const updated = files.filter((f) => f.status === "pending");
    toast.success(`Batch scan complete!`);
  };

  const selectedFile = files.find((f) => f.id === selectedId) || null;
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const totalCount = files.length;
  const progress = totalCount > 0 ? Math.round(((totalCount - pendingCount) / totalCount) * 100) : 0;

  const handleSaveResult = (updated: OcrResult) => {
    if (!selectedId) return;
    setFiles((prev) => prev.map((f) => f.id === selectedId ? { ...f, result: updated } : f));
    toast.success("Changes saved!");
  };

  const clearAll = () => {
    setFiles([]);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            OCR <span className="gradient-text">Scanner</span>
          </h1>
          <p className="text-muted-foreground mb-8">Upload multiple documents to extract text and structured data using AI.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & Queue */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <DropZone onFiles={addFiles} currentCount={files.length} />

            <FileQueue files={files} onRemove={removeFile} onSelect={setSelectedId} selectedId={selectedId} />

            {files.length > 0 && (
              <div className="space-y-3">
                {scanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Processing…</span>
                      <span>{doneCount}/{totalCount}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleScanAll}
                    disabled={scanning || pendingCount === 0}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground py-5"
                  >
                    {scanning ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scanning…</>
                    ) : (
                      <><ScanLine className="mr-2 h-5 w-5" /> Scan All ({pendingCount})</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll} disabled={scanning} className="rounded-xl">
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <ResultPanel
              result={selectedFile?.result || null}
              fileName={selectedFile?.file.name || null}
              onSave={handleSaveResult}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OcrScanner;
