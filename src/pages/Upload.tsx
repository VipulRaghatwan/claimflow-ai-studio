import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Upload as UploadIcon, FileText, Image, X, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";

interface UploadedFile {
  name: string;
  size: string;
  type: "image" | "document";
  preview?: string;
}

const UploadPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const mapped: UploadedFile[] = newFiles.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type.startsWith("image") ? "image" : "document",
      preview: f.type.startsWith("image") ? URL.createObjectURL(f) : undefined,
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen animated-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
            Upload <span className="gradient-text">Claim</span>
          </h1>
          <p className="text-muted-foreground mb-8">Upload images or documents for AI-powered analysis.</p>
        </motion.div>

        {uploaded ? (
          <motion.div
            className="glass p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Upload Complete!</h2>
            <p className="text-muted-foreground mb-6">Your files are being processed by our AI engines.</p>
            <Link to="/claim-result">
              <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                View Results
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {/* Drop zone */}
            <div
              className={`glass border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                dragging ? "border-primary bg-primary/5" : "border-glass-border hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
              />
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                <UploadIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-display mb-1">Drop files here or click to browse</h3>
              <p className="text-sm text-muted-foreground">Supports JPG, PNG, PDF • Max 25MB per file</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="glass flex items-center gap-4 p-4">
                    {file.preview ? (
                      <img src={file.preview} alt={file.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        {file.type === "image" ? <Image className="h-5 w-5 text-accent" /> : <FileText className="h-5 w-5 text-primary" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.size}</p>
                    </div>
                    <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg mt-4"
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    <><UploadIcon className="mr-2 h-5 w-5" /> Upload & Analyze</>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
