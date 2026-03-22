import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, Image, X, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  type: "image" | "document";
  preview?: string;
}

const UploadPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [claimId, setClaimId] = useState<string | null>(null);
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const mapped: UploadedFile[] = newFiles.map((f) => ({
      file: f,
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

  const handleUpload = async () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to upload claims");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setUploadStage("Creating claim record...");

    try {
      // 1. Create claim record
      const { data: claim, error: claimError } = await supabase
        .from("claims")
        .insert({ user_id: session.user.id })
        .select()
        .single();

      if (claimError) throw new Error(`Failed to create claim: ${claimError.message}`);

      setUploadProgress(20);
      setUploadStage("Uploading files...");

      // 2. Upload files to storage
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        const f = files[i];
        const filePath = `${session.user.id}/${claim.id}/${Date.now()}-${f.name}`;

        const { error: uploadError } = await supabase.storage
          .from("claim-files")
          .upload(filePath, f.file);

        if (uploadError) throw new Error(`Failed to upload ${f.name}: ${uploadError.message}`);

        // Record file in claim_files table
        const { error: fileRecordError } = await supabase.from("claim_files").insert({
          claim_id: claim.id,
          file_name: f.name,
          file_path: filePath,
          file_type: f.file.type,
          file_size: f.file.size,
        });

        if (fileRecordError) throw new Error(`Failed to record file: ${fileRecordError.message}`);

        setUploadProgress(20 + ((i + 1) / totalFiles) * 30);
      }

      setUploadProgress(55);
      setUploadStage("Running AI analysis...");

      // 3. Trigger AI analysis
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        "analyze-claim",
        { body: { claimId: claim.id } }
      );

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast.error("Files uploaded but AI analysis failed. You can retry from claim history.");
      } else {
        setUploadProgress(100);
        setUploadStage("Analysis complete!");
      }

      setClaimId(claim.id);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
      setUploading(false);
      setUploadProgress(0);
      setUploadStage("");
    }
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

        {claimId ? (
          <motion.div
            className="glass p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Upload Complete!</h2>
            <p className="text-muted-foreground mb-6">Your files have been analyzed by our AI engines.</p>
            <Button
              onClick={() => navigate(`/claim-result/${claimId}`)}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              View Results
            </Button>
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
              onClick={() => !uploading && document.getElementById("file-input")?.click()}
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
                    {!uploading && (
                      <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                {uploading && (
                  <div className="glass p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{uploadStage}</span>
                      <span className="font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

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
